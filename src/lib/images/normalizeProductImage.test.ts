// @vitest-environment node
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { normalizeProductImage } from './normalizeProductImage';

const PHONE = { width: 20, height: 40 };

async function phonePicture(
  background: sharp.Color,
  position: { left: number; top: number },
): Promise<Buffer> {
  const phone = await sharp({
    create: { ...PHONE, channels: 4, background: '#1b1a18' },
  })
    .png()
    .toBuffer();

  return sharp({
    create: { width: 100, height: 100, channels: 4, background },
  })
    .composite([{ input: phone, ...position }])
    .png()
    .toBuffer();
}

async function describeResult(image: Buffer) {
  const { data, info } = await sharp(image)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, topLeftAlpha: data[3] };
}

describe('normalizeProductImage', () => {
  it('frames every phone the same way whatever margin the source image has', async () => {
    const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
    const smallMargin = await phonePicture(transparent, { left: 2, top: 2 });
    const bigMargin = await phonePicture(transparent, { left: 40, top: 30 });

    expect(
      await describeResult(await normalizeProductImage(smallMargin)),
    ).toEqual(await describeResult(await normalizeProductImage(bigMargin)));
    expect(
      await describeResult(await normalizeProductImage(bigMargin)),
    ).toMatchObject(PHONE);
  });

  it('removes an opaque white background so no white box shows on hover', async () => {
    const onWhite = await phonePicture('#ffffff', { left: 30, top: 25 });

    const result = await describeResult(await normalizeProductImage(onWhite));

    expect(result).toMatchObject(PHONE);
  });

  it('still crops a phone that touches the top-left corner of the image', async () => {
    const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
    const inCorner = await phonePicture(transparent, { left: 0, top: 0 });

    expect(
      await describeResult(await normalizeProductImage(inCorner)),
    ).toMatchObject({ ...PHONE, topLeftAlpha: 255 });
  });
});
