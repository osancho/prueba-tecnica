// The API advertises http:// image URLs that only redirect to https://.
export function secureImageUrl(url: string): string {
  return url.replace(/^http:\/\//, 'https://');
}
