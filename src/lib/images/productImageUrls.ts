import { readServerEnv } from '@/lib/serverConfig';

const IMAGE_FILE_PATTERN = /^[\w-]+\.(?:webp|png|jpe?g)$/i;

export function isProductImageFile(file: string): boolean {
  return IMAGE_FILE_PATTERN.test(file);
}

export function productImageUrl(sourceUrl: string): string {
  return `/api/images/${sourceUrl.slice(sourceUrl.lastIndexOf('/') + 1)}`;
}

export function originalImageUrl(file: string): URL {
  return new URL(`/images/${file}`, readServerEnv('API_BASE_URL'));
}
