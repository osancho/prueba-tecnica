import 'server-only';

// Render's free plan can take close to a minute to wake up.
export const UPSTREAM_TIMEOUT_MS = 60_000;

export function readServerEnv(name: 'API_BASE_URL' | 'API_KEY'): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}
