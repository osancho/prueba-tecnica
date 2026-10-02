// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { removeWhiteBackground } from '../remove-white-background';

const WHITE = [255, 255, 255, 255];
const BLACK = [0, 0, 0, 255];
const CLEAR = [0, 0, 0, 0];

function image(rows: number[][][]) {
  return {
    data: Uint8Array.from(rows.flat(2)),
    width: rows[0].length,
    height: rows.length,
  };
}

function alphaAt(data: Uint8Array, width: number, x: number, y: number) {
  return data[(y * width + x) * 4 + 3];
}

describe('removeWhiteBackground', () => {
  // A black phone outline with a white screen inside, on a white background.
  const phoneOnWhite = image([
    [WHITE, WHITE, WHITE, WHITE, WHITE],
    [WHITE, BLACK, BLACK, BLACK, WHITE],
    [WHITE, BLACK, WHITE, BLACK, WHITE],
    [WHITE, BLACK, BLACK, BLACK, WHITE],
    [WHITE, WHITE, WHITE, WHITE, WHITE],
  ]);

  it('turns the white background around the phone transparent', () => {
    const result = removeWhiteBackground(phoneOnWhite);

    expect(alphaAt(result, 5, 0, 0)).toBe(0);
    expect(alphaAt(result, 5, 4, 2)).toBe(0);
    expect(alphaAt(result, 5, 1, 1)).toBe(255);
  });

  it('keeps white parts enclosed by the phone, such as its screen', () => {
    const result = removeWhiteBackground(phoneOnWhite);

    expect(alphaAt(result, 5, 2, 2)).toBe(255);
  });

  it('leaves images that already have a transparent background untouched', () => {
    const transparent = image([
      [CLEAR, CLEAR, CLEAR],
      [CLEAR, WHITE, CLEAR],
      [CLEAR, CLEAR, CLEAR],
    ]);

    expect(removeWhiteBackground(transparent)).toEqual(transparent.data);
  });
});
