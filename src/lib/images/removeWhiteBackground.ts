const CHANNELS = 4;
const WHITE_THRESHOLD = 245;

interface RgbaImage {
  data: Uint8Array;
  width: number;
  height: number;
}

function isOpaqueWhite(data: Uint8Array, offset: number): boolean {
  return (
    data[offset + 3] > 0 &&
    data[offset] >= WHITE_THRESHOLD &&
    data[offset + 1] >= WHITE_THRESHOLD &&
    data[offset + 2] >= WHITE_THRESHOLD
  );
}

function borderPixels(width: number, height: number): number[] {
  const pixels: number[] = [];
  for (let x = 0; x < width; x++) pixels.push(x, (height - 1) * width + x);
  for (let y = 1; y < height - 1; y++)
    pixels.push(y * width, y * width + width - 1);
  return pixels;
}

/**
 * Makes transparent the white background connected to the image border.
 * White areas enclosed by the phone outline (screens, white bodies) are kept.
 */
export function removeWhiteBackground({
  data,
  width,
  height,
}: RgbaImage): Uint8Array {
  const result = Uint8Array.from(data);
  const visited = new Uint8Array(width * height);
  const pending = borderPixels(width, height);

  while (pending.length > 0) {
    const pixel = pending.pop()!;
    if (visited[pixel]) continue;
    visited[pixel] = 1;

    const offset = pixel * CHANNELS;
    if (!isOpaqueWhite(result, offset)) continue;
    result[offset + 3] = 0;

    const x = pixel % width;
    const y = (pixel - x) / width;
    if (x > 0) pending.push(pixel - 1);
    if (x < width - 1) pending.push(pixel + 1);
    if (y > 0) pending.push(pixel - width);
    if (y < height - 1) pending.push(pixel + width);
  }

  return result;
}
