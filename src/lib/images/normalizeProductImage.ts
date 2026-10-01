import sharp from 'sharp';
import { removeWhiteBackground } from './removeWhiteBackground';

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/**
 * Gives every product image the same framing: transparent background and
 * no empty margin around the phone, whatever the source image looks like.
 */
export async function normalizeProductImage(source: Buffer): Promise<Buffer> {
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
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      // An explicit background is required: the default (top-left pixel)
      // trims nothing when the phone touches that corner.
      .trim({ background: TRANSPARENT })
      .webp({ quality: 90 })
      .toBuffer()
  );
}
