import sharp from 'sharp';
import { removeWhiteBackground } from './remove-white-background';

const CHANNELS = 4;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
// Figma's product photos are squares with the phone filling 73.2% of them:
// the cards fit that square, the detail page fills its box with it.
const PHONE_SHARE_OF_SQUARE = 0.732;

/**
 * The expensive part of normalizing a photo, the same for every width: decodes it,
 * removes its white background and trims it to the phone. Returns a lossless PNG,
 * which keeps the pixels exactly at a fraction of their raw size.
 */
export async function cutOutPhone(source: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const transparentBackground = removeWhiteBackground({
    data,
    width: info.width,
    height: info.height,
  });

  return (
    sharp(transparentBackground, {
      raw: { width: info.width, height: info.height, channels: CHANNELS },
    })
      // An explicit background is required: the default (top-left pixel)
      // trims nothing when the phone touches that corner.
      .trim({ background: TRANSPARENT })
      .png()
      .toBuffer()
  );
}

/**
 * Gives the phone the Figma framing whatever its photo looked like: centred in a
 * transparent square at the same scale, at most `maxWidth` pixels wide.
 */
export async function frameProductImage(
  phone: Buffer,
  maxWidth: number,
): Promise<Buffer> {
  const maxPhoneSide = Math.floor(maxWidth * PHONE_SHARE_OF_SQUARE);
  const resized = await sharp(phone)
    // Sized so the square around it stays within maxWidth. Small photos keep their
    // size: enlarging them would only blur them.
    .resize(maxPhoneSide, maxPhoneSide, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = resized.info;
  const side = Math.ceil(Math.max(width, height) / PHONE_SHARE_OF_SQUARE);
  const left = Math.floor((side - width) / 2);
  const top = Math.floor((side - height) / 2);

  return sharp(resized.data, {
    raw: { width, height, channels: CHANNELS },
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
