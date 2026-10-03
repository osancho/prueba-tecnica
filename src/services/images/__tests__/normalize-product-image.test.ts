// @vitest-environment node
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { normalizeProductImage } from '../normalize-product-image';

const PHONE = { width: 20, height: 40 };
// Wider than any test picture, so only the framing applies.
const ANY_WIDTH = 1260;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

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

async function framing(image: Buffer) {
  const { width, height } = await sharp(image).metadata();
  const { info } = await sharp(image)
    .trim({ background: TRANSPARENT })
    .toBuffer({ resolveWithObject: true });
  return {
    picture: { width, height },
    phone: { width: info.width, height: info.height },
    phoneTop: -(info.trimOffsetTop ?? 0),
  };
}

describe('normalizeProductImage', () => {
  it('shows every phone at the Figma scale: centred, filling 73% of a square picture', async () => {
    const result = await framing(
      await normalizeProductImage(
        await phonePicture(TRANSPARENT, { left: 40, top: 30 }),
        ANY_WIDTH,
      ),
    );

    expect(result).toEqual({
      picture: { width: 55, height: 55 },
      phone: PHONE,
      phoneTop: 7,
    });
  });

  it('frames phones the same way whatever margin or corner the source has', async () => {
    const results = await Promise.all(
      [
        { left: 0, top: 0 },
        { left: 2, top: 2 },
        { left: 40, top: 30 },
      ].map(async (position) =>
        framing(
          await normalizeProductImage(
            await phonePicture(TRANSPARENT, position),
            ANY_WIDTH,
          ),
        ),
      ),
    );

    expect(new Set(results.map((result) => JSON.stringify(result))).size).toBe(
      1,
    );
  });

  it('removes an opaque white background so no white box shows on hover', async () => {
    const onWhite = await phonePicture('#ffffff', { left: 30, top: 25 });

    const result = await framing(
      await normalizeProductImage(onWhite, ANY_WIDTH),
    );

    expect(result.phone).toEqual(PHONE);
  });

  it('shrinks a large photo to the width the page asks for, at the same scale', async () => {
    const result = await framing(
      await normalizeProductImage(
        await phonePicture(TRANSPARENT, { left: 40, top: 30 }),
        44,
      ),
    );

    expect(result).toEqual({
      picture: { width: 44, height: 44 },
      phone: { width: 16, height: 32 },
      phoneTop: 6,
    });
  });

  it('never enlarges a photo smaller than the width asked, which would only blur it', async () => {
    const result = await framing(
      await normalizeProductImage(
        await phonePicture(TRANSPARENT, { left: 40, top: 30 }),
        100,
      ),
    );

    expect(result.picture).toEqual({ width: 55, height: 55 });
  });
});
