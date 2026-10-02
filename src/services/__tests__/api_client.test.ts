// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../api_client';
import { ApiRequestError, NotFoundError } from '../api_errors';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubEnv('API_BASE_URL', 'https://api.test');
    vi.stubEnv('API_KEY', 'test-key');
    vi.stubGlobal('fetch', fetchMock);
  });

  it('requests the API with the key header and the defined query params', async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ id: 'A' }]));

    const data = await apiClient('/products', {
      search: 'galaxy',
      limit: undefined,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://api.test/products?search=galaxy');
    expect(init.headers).toEqual({ 'x-api-key': 'test-key' });
    expect(data).toEqual([{ id: 'A' }]);
  });

  it('throws NotFoundError on 404', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'NOT-FOUND', message: 'Product not found' }, 404),
    );

    await expect(apiClient('/products/NOPE')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('throws ApiRequestError with the API error body on other failures', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'UNAUTHORIZED', message: 'Invalid API key' }, 401),
    );

    const error = await apiClient('/products').catch((caught) => caught);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({
      status: 401,
      body: { error: 'UNAUTHORIZED', message: 'Invalid API key' },
    });
  });

  it('fails fast when the API key is not configured', async () => {
    vi.stubEnv('API_KEY', '');

    await expect(apiClient('/products')).rejects.toThrow(
      'Missing environment variable: API_KEY',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps responses that only one user needs out of the shared cache', async () => {
    fetchMock.mockImplementation(async () => jsonResponse([]));

    await apiClient('/products', {}, { cacheable: false });
    await apiClient('/products');

    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: 'no-store' });
    expect(fetchMock.mock.calls[0][1].next).toBeUndefined();
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      next: { revalidate: 3600 },
    });
  });
});
