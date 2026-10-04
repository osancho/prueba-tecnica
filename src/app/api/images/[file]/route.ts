import { normalizeProductImage } from '@/services/images/normalize-product-image';
import {
  isProductImageFile,
  originalImageUrl,
  productImageWidth,
} from '@/services/images/product-image-urls';
import { UPSTREAM_TIMEOUT_MS } from '@/services/server-config';

// Same lifetime the API gives its images.
const CACHE_SECONDS = 86_400;

// Image URLs carry a version (`?v=`), so a given URL never changes: browsers may keep it for good.
const BROWSER_CACHE_CONTROL = 'public, max-age=31536000, immutable';

// sharp is the expensive part. Without a CDN in front, this map is the only cache; with one, the
// CDN can keep these immutable responses and leave the map its misses. Only images the API
// actually has get stored, at the few widths the app serves, so the catalogue bounds the map
// (about 60 images × 5 widths, under 8 MB). It lives in the process and empties on restart;
// a much larger catalogue would need disk. It holds the promise, not the bytes, so the burst of
// requests a list sends right after a restart shares one normalization per file and width.
const normalizedImages = new Map<string, Promise<Uint8Array<ArrayBuffer>>>();

class OriginalImageError extends Error {
  constructor(readonly status: number) {
    super(`Original image request failed: ${status}`);
  }
}

async function normalizeOriginal(
  file: string,
  width: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const original = await fetch(originalImageUrl(file), {
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!original.ok) throw new OriginalImageError(original.status);

  return new Uint8Array(
    await normalizeProductImage(
      Buffer.from(await original.arrayBuffer()),
      width,
    ),
  );
}

function normalizedImage(
  file: string,
  width: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const cacheKey = `${file}@${width}`;
  const known = normalizedImages.get(cacheKey);
  if (known) return known;

  const image = normalizeOriginal(file, width);
  normalizedImages.set(cacheKey, image);
  // A failure is shared by the requests already waiting, never by the next ones.
  image.catch((error: unknown) => {
    normalizedImages.delete(cacheKey);
    if (!(error instanceof OriginalImageError)) {
      console.error('Product image normalization failed', file, error);
    }
  });
  return image;
}

function imageResponse(image: Uint8Array<ArrayBuffer>): Response {
  return new Response(image, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': BROWSER_CACHE_CONTROL,
    },
  });
}

interface ImageRouteContext {
  params: Promise<{ file: string }>;
}

export async function GET(request: Request, { params }: ImageRouteContext) {
  const { file } = await params;
  const width = productImageWidth(new URL(request.url).searchParams.get('w'));
  if (!isProductImageFile(file) || !width) {
    return new Response(null, { status: 400 });
  }

  try {
    return imageResponse(await normalizedImage(file, width));
  } catch (error) {
    const missing = error instanceof OriginalImageError && error.status === 404;
    return new Response(null, { status: missing ? 404 : 502 });
  }
}
