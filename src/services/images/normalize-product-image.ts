import sharp from 'sharp';
import { removeWhiteBackground } from './remove-white-background';

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
// Figma's product photos are squares with the phone filling 73.2% of them:
// the cards fit that square, the detail page fills its box with it.
const PHONE_SHARE_OF_SQUARE = 0.732;

/**
 * Gives every product image the Figma framing whatever the source looks like:
 * transparent background and the phone centred in a square at the same scale,
 * at most `maxWidth` pixels wide.
 */
export async function normalizeProductImage(
  source: Buffer,
  maxWidth: number,
): Promise<Buffer> {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const transparentBackground = removeWhiteBackground({
    data,
    width: info.width,
    height: info.height,
  });

  const maxPhoneSide = Math.floor(maxWidth * PHONE_SHARE_OF_SQUARE);
  const phone = await sharp(transparentBackground, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    // An explicit background is required: the default (top-left pixel)
    // trims nothing when the phone touches that corner.
    .trim({ background: TRANSPARENT })
    // Sized so the square around it stays within maxWidth. Small photos keep their
    // size: enlarging them would only blur them.
    .resize(maxPhoneSide, maxPhoneSide, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer({ resolveWithObject: true });

  const { width, height } = phone.info;
  const side = Math.ceil(Math.max(width, height) / PHONE_SHARE_OF_SQUARE);
  const left = Math.floor((side - width) / 2);
  const top = Math.floor((side - height) / 2);

  return sharp(phone.data, {
    raw: { width, height, channels: 4 },
  })
    .extend({
      top,
      bottom: side - height - top,
      left,
      right: side - width - left,
      background: TRANSPARENT,
    })
    .webp({ quality: 90 })
    .toBuffer();
}
