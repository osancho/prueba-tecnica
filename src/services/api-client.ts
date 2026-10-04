import 'server-only';
import { ApiRequestError, NotFoundError, type ApiError } from './api-errors';
import { readServerEnv, UPSTREAM_TIMEOUT_MS } from './server-config';

const REVALIDATE_SECONDS = 3600;

type QueryParams = Record<string, string | undefined>;

function buildUrl(path: string, params: QueryParams): URL {
  const url = new URL(path, readServerEnv('API_BASE_URL'));
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

interface ApiClientOptions {
  /** Only responses many users share should land in Next's on-disk Data Cache. */
  cacheable?: boolean;
  timeoutMs?: number;
}

export async function apiClient<T>(
  path: string,
  params: QueryParams = {},
  { cacheable = true, timeoutMs = UPSTREAM_TIMEOUT_MS }: ApiClientOptions = {},
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    headers: { 'x-api-key': readServerEnv('API_KEY') },
    ...(cacheable
      ? { next: { revalidate: REVALIDATE_SECONDS } }
      : { cache: 'no-store' }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (response.ok) return (await response.json()) as T;
  if (response.status === 404) throw new NotFoundError(path);

  const body = (await response.json().catch(() => null)) as ApiError | null;
  throw new ApiRequestError(
    response.status,
    body ?? { error: 'UNKNOWN', message: response.statusText },
  );
}
