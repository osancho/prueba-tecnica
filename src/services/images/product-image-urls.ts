import { readServerEnv } from '@/services/server-config';

const IMAGE_FILE_PATTERN = /^[\w-]+\.(?:webp|png|jpe?g)$/i;

export function isProductImageFile(file: string): boolean {
  return IMAGE_FILE_PATTERN.test(file);
}

// Bump whenever normalizeProductImage changes its output: images are cached for a day,
// and a new URL is the only way browsers fetch the new framing instead of the old one.
const NORMALIZED_IMAGE_VERSION = 2;

export function productImageUrl(sourceUrl: string): string {
  const file = sourceUrl.slice(sourceUrl.lastIndexOf('/') + 1);
  return `/api/images/${file}?v=${NORMALIZED_IMAGE_VERSION}`;
}

export function originalImageUrl(file: string): URL {
  return new URL(`/images/${file}`, readServerEnv('API_BASE_URL'));
}
