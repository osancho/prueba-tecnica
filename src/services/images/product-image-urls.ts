import { PRODUCT_IMAGE_WIDTHS } from '@/lib/product-image-loader';
import { readServerEnv } from '@/services/server-config';

const IMAGE_FILE_PATTERN = /^[\w-]+\.(?:webp|png|jpe?g)$/i;

export function isProductImageFile(file: string): boolean {
  return IMAGE_FILE_PATTERN.test(file);
}

/**
 * The width asked for in `?w=`, only if it is one the app serves. URLs without one (pages
 * rendered before widths existed) get the largest.
 */
export function productImageWidth(
  requested: string | null,
): number | undefined {
  if (requested === null) return PRODUCT_IMAGE_WIDTHS.at(-1);
  return PRODUCT_IMAGE_WIDTHS.find((width) => String(width) === requested);
}

// Bump whenever normalizeProductImage changes its output: browsers keep images for a year
// (`immutable`), and a new URL is the only way they fetch the new version instead of the old one.
const NORMALIZED_IMAGE_VERSION = 3;

export function productImageUrl(sourceUrl: string): string {
  const file = sourceUrl.slice(sourceUrl.lastIndexOf('/') + 1);
  return `/api/images/${file}?v=${NORMALIZED_IMAGE_VERSION}`;
}

export function originalImageUrl(file: string): URL {
  return new URL(`/images/${file}`, readServerEnv('API_BASE_URL'));
}
