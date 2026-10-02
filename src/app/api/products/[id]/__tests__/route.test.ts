// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { getProduct } from '@/core/product/application/get-product';
import { galaxy } from '@/core/product/domain/__mocks__/product-fixture';
import { apiProductRepository } from '@/core/product/infrastructure/api-product-repository';
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
  it('returns the phone as the catalog serves it', async () => {
    getProductMock.mockResolvedValue(galaxy);

    const response = await requestProduct('SMG-S24U');

    expect(getProductMock).toHaveBeenCalledWith(
      apiProductRepository,
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
});
