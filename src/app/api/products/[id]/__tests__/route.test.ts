// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { getProduct } from '@/core/product/application/get-product';
import { galaxy } from '@/core/product/domain/__mocks__/product-fixture';
import { liveApiProductRepository } from '@/core/product/infrastructure/api-product-repository';
import { GET } from '../route';

vi.mock('@/core/product/application/get-product', () => ({
  getProduct: vi.fn(),
}));

const getProductMock = vi.mocked(getProduct);

function requestProduct(id: string) {
  return GET(new NextRequest(`http://localhost/api/products/${id}`), {
    params: Promise.resolve({ id }),
  });
}

describe('GET /api/products/[id]', () => {
  it('returns the phone as the live catalog serves it, not the cached copy', async () => {
    getProductMock.mockResolvedValue(galaxy);

    const response = await requestProduct('SMG-S24U');

    expect(getProductMock).toHaveBeenCalledWith(
      liveApiProductRepository,
      'SMG-S24U',
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(galaxy);
  });

  it('answers null, not an error, for a phone that no longer exists', async () => {
    getProductMock.mockResolvedValue(null);

    const response = await requestProduct('NOPE');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toBeNull();
  });

  it('answers 502 when the products API is down', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getProductMock.mockRejectedValue(new Error('timeout'));

    expect((await requestProduct('SMG-S24U')).status).toBe(502);
  });

  it('tells browsers and proxies never to keep the answer', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getProductMock.mockResolvedValueOnce(galaxy);
    getProductMock.mockRejectedValueOnce(new Error('timeout'));

    const found = await requestProduct('SMG-S24U');
    const failed = await requestProduct('SMG-S24U');

    expect(found.headers.get('Cache-Control')).toBe('no-store');
    expect(failed.headers.get('Cache-Control')).toBe('no-store');
  });
});
