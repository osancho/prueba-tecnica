import 'server-only';

// Render's free plan can take close to a minute to wake up.
export const UPSTREAM_TIMEOUT_MS = 60_000;

/**
 * Public address of the deployed site, for absolute URLs in metadata, robots and the sitemap.
 * Undefined where the app has no public address: local runs and CI.
 */
export function siteUrl(): URL | undefined {
  const value = process.env.SITE_URL;
  return value ? new URL(value) : undefined;
}

export function readServerEnv(name: 'API_BASE_URL' | 'API_KEY'): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
