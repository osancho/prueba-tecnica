// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { getProducts } from '@/core/product/application/get-products';
import { apiProductRepository } from '@/core/product/infrastructure/api-product-repository';
import { GET } from '../route';

vi.mock('@/core/product/application/get-products', () => ({
  getProducts: vi.fn(),
}));

const getProductsMock = vi.mocked(getProducts);

function searchRequest(query: string): NextRequest {
  return new NextRequest(`http://localhost/api/products${query}`);
}

describe('GET /api/products', () => {
  it('returns the phones matching what the user typed, ignoring surrounding spaces', async () => {
    const results = [
      {
        id: 'SMG-S24U',
        brand: 'Samsung',
        name: 'Galaxy S24 Ultra',
        basePrice: 1329,
        imageUrl: 'https://cdn.test/images/SMG-S24U.webp',
      },
    ];
    getProductsMock.mockResolvedValue(results);

    const response = await GET(searchRequest('?search=%20galaxy%20'));

    expect(getProductsMock).toHaveBeenCalledWith(
      apiProductRepository,
      'galaxy',
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(results);
  });

  it('returns the default catalog when the search box is empty', async () => {
    getProductsMock.mockResolvedValue([]);

    await GET(searchRequest('?search=%20%20'));

    expect(getProductsMock).toHaveBeenCalledWith(
      apiProductRepository,
      undefined,
    );
  });

  it('answers with a readable 502 when the products API is down', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    getProductsMock.mockRejectedValue(new Error('timeout'));

    const response = await GET(searchRequest('?search=pixel'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'BAD-GATEWAY',
      message: 'Products are temporarily unavailable',
    });
  });
});
