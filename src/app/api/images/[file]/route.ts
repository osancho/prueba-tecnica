import { normalizeProductImage } from '@/lib/images/normalizeProductImage';
import {
  isProductImageFile,
  originalImageUrl,
} from '@/lib/images/productImageUrls';
import { UPSTREAM_TIMEOUT_MS } from '@/lib/serverConfig';

// Same lifetime the API gives its images.
const CACHE_SECONDS = 86_400;

interface ImageRouteContext {
  params: Promise<{ file: string }>;
}

export async function GET(_request: Request, { params }: ImageRouteContext) {
  const { file } = await params;
  if (!isProductImageFile(file)) return new Response(null, { status: 400 });

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

    const image = await normalizeProductImage(
      Buffer.from(await original.arrayBuffer()),
    );

    return new Response(new Uint8Array(image), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error('Product image normalization failed', file, error);
    return new Response(null, { status: 502 });
  }
}
