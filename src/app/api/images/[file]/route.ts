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

// sharp is the expensive part and there is no CDN in front of the VPS. Only images the API
// actually has get stored, at the few widths the app serves, so the catalogue bounds the map
// (about 60 images × 5 widths, under 8 MB). It lives in the process and empties on restart;
// a much larger catalogue would need disk.
const normalizedImages = new Map<string, Uint8Array<ArrayBuffer>>();

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

  const cacheKey = `${file}@${width}`;
  const cached = normalizedImages.get(cacheKey);
  if (cached) return imageResponse(cached);

  try {
    const original = await fetch(originalImageUrl(file), {
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!original.ok) {
      return new Response(null, {
        status: original.status === 404 ? 404 : 502,
      });
    }

    const image = new Uint8Array(
      await normalizeProductImage(
        Buffer.from(await original.arrayBuffer()),
        width,
      ),
    );
    normalizedImages.set(cacheKey, image);
    return imageResponse(image);
  } catch (error) {
    console.error('Product image normalization failed', file, error);
    return new Response(null, { status: 502 });
  }
}
