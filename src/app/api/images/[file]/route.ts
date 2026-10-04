import {
  cutOutPhone,
  frameProductImage,
} from '@/services/images/normalize-product-image';
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

// Two in-process caches, emptied on restart; with a CDN in front, it keeps these immutable
// responses and leaves the caches its misses. Both hold promises, not results, so the burst of
// requests a list sends right after a restart shares the work, and both forget failures, so a
// failure reaches the requests already waiting but never the next ones.
// The cut-out phone is the expensive part (decoding and the background flood fill, which runs on
// the thread that renders pages), so it is done once per photo and every width is drawn from it.
// Kept as PNG, the 62 photos of the catalogue take about 32 MB.
const phoneCutouts = new Map<string, Promise<Buffer>>();
// The responses, at the few widths the app serves: about 60 photos × 5 widths, under 8 MB.
// A much larger catalogue would need disk for both.
const normalizedImages = new Map<string, Promise<Uint8Array<ArrayBuffer>>>();

class OriginalImageError extends Error {
  constructor(readonly status: number) {
    super(`Original image request failed: ${status}`);
  }
}

function sharedUntilFailure<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  create: () => Promise<T>,
): Promise<T> {
  const known = cache.get(key);
  if (known) return known;

  const created = create();
  cache.set(key, created);
  created.catch(() => cache.delete(key));
  return created;
}

async function cutOutOriginal(file: string): Promise<Buffer> {
  const original = await fetch(originalImageUrl(file), {
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!original.ok) throw new OriginalImageError(original.status);

  return cutOutPhone(Buffer.from(await original.arrayBuffer()));
}

function normalizedImage(
  file: string,
  width: number,
): Promise<Uint8Array<ArrayBuffer>> {
  return sharedUntilFailure(normalizedImages, `${file}@${width}`, async () => {
    const phone = await sharedUntilFailure(phoneCutouts, file, () =>
      cutOutOriginal(file),
    );
    return new Uint8Array(await frameProductImage(phone, width));
  });
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
    if (!(error instanceof OriginalImageError)) {
      console.error('Product image normalization failed', file, error);
    }
    const missing = error instanceof OriginalImageError && error.status === 404;
    return new Response(null, { status: missing ? 404 : 502 });
  }
}
