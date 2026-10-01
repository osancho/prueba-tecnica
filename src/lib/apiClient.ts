import 'server-only';
import type { ApiError } from '@/types/product';
import { ApiRequestError, NotFoundError } from './apiErrors';

const REVALIDATE_SECONDS = 3600;
// Render's free plan can take close to a minute to wake up.
const REQUEST_TIMEOUT_MS = 60_000;

type QueryParams = Record<string, string | undefined>;

function readEnv(name: 'API_BASE_URL' | 'API_KEY'): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function buildUrl(path: string, params: QueryParams): URL {
  const url = new URL(path, readEnv('API_BASE_URL'));
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

export async function apiClient<T>(
  path: string,
  params: QueryParams = {},
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    headers: { 'x-api-key': readEnv('API_KEY') },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.ok) return (await response.json()) as T;
  if (response.status === 404) throw new NotFoundError(path);

  const body = (await response.json().catch(() => null)) as ApiError | null;
  throw new ApiRequestError(
    response.status,
    body ?? { error: 'UNKNOWN', message: response.statusText },
  );
}
