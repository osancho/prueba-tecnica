// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/services/api-client';
import { InvalidApiResponseError, NotFoundError } from '@/services/api-errors';
import type { Product, ProductListItem } from '../../domain/product';
import { apiProductRepository } from '../api-product-repository';

vi.mock('@/services/api-client', () => ({ apiClient: vi.fn() }));

const apiClientMock = vi.mocked(apiClient);

function phone(id: string): ProductListItem {
  return {
    id,
    brand: 'Brand',
    name: `Phone ${id}`,
    basePrice: 100,
    imageUrl: `http://cdn.test/images/${id}.webp`,
  };
}

function productDetail(overrides: Partial<Product> = {}): Product {
  return {
    ...phone('MAIN'),
    description: 'Description',
    rating: 4,
    specs: {
      screen: '',
      resolution: '',
      processor: '',
      mainCamera: '',
      selfieCamera: '',
      battery: '',
      os: '',
      screenRefreshRate: '',
    },
    colorOptions: [
      {
        name: 'Black',
        hexCode: '#000000',
        imageUrl: 'http://cdn.test/images/MAIN-black.webp',
      },
    ],
    storageOptions: [{ capacity: '128 GB', price: 100 }],
    similarProducts: [],
    ...overrides,
  };
}

describe('apiProductRepository.list', () => {
  it('serves every phone picture through the image normalizer of our own domain', async () => {
    apiClientMock.mockResolvedValue([phone('P1')]);

    const [product] = await apiProductRepository.list({ limit: 40 });

    expect(product.imageUrl).toBe('/api/images/P1.webp?v=2');
  });

  it('leaves out a malformed phone instead of failing the whole catalog', async () => {
    apiClientMock.mockResolvedValue([
      phone('P1'),
      { ...phone('P2'), basePrice: '100' },
      { id: 'P3' },
      null,
      phone('P4'),
    ]);

    const products = await apiProductRepository.list({ limit: 40 });

    expect(products.map(({ id }) => id)).toEqual(['P1', 'P4']);
  });

  it('fails when the API does not answer with a list', async () => {
    apiClientMock.mockResolvedValue({ error: 'unexpected' });

    await expect(apiProductRepository.list({ limit: 40 })).rejects.toThrow(
      InvalidApiResponseError,
    );
  });

  it('caches the catalog for everyone but never a single search', async () => {
    apiClientMock.mockResolvedValue([]);

    await apiProductRepository.list({ limit: 40 });
    await apiProductRepository.list({ search: 'galaxy', limit: 40 });

    expect(apiClientMock.mock.calls[0][2]).toEqual({ cacheable: true });
    expect(apiClientMock.mock.calls[1][2]).toEqual({ cacheable: false });
  });

  it('sends at most 50 characters of a search to the API', async () => {
    apiClientMock.mockResolvedValue([]);

    await apiProductRepository.list({ search: 'a'.repeat(80), limit: 40 });

    expect(apiClientMock).toHaveBeenCalledWith(
      '/products',
      expect.objectContaining({ search: 'a'.repeat(50) }),
      expect.anything(),
    );
  });

  it('forwards the search term to the API', async () => {
    apiClientMock.mockResolvedValue([]);

    await apiProductRepository.list({ search: 'galaxy', limit: 40 });

    expect(apiClientMock).toHaveBeenCalledWith(
      '/products',
      expect.objectContaining({ search: 'galaxy' }),
      expect.anything(),
    );
  });
});

describe('apiProductRepository.findById', () => {
  it('normalizes every picture of the phone and of its similar products', async () => {
    apiClientMock.mockResolvedValue(
      productDetail({
        similarProducts: [phone('S1')],
      }),
    );

    const product = await apiProductRepository.findById('MAIN');

    expect(product?.similarProducts[0].imageUrl).toBe(
      '/api/images/S1.webp?v=2',
    );
    expect(product?.colorOptions[0].imageUrl).toBe(
      '/api/images/MAIN-black.webp?v=2',
    );
  });

  it('leaves out malformed similar products', async () => {
    apiClientMock.mockResolvedValue(
      productDetail({
        similarProducts: [phone('S1'), { id: 'S2' } as ProductListItem],
      }),
    );

    const product = await apiProductRepository.findById('MAIN');

    expect(product?.similarProducts.map(({ id }) => id)).toEqual(['S1']);
  });

  it.each([
    ['no storage options', { storageOptions: undefined }],
    ['a price that is not a number', { basePrice: '1329' }],
    ['a color without picture', { colorOptions: [{ name: 'Black' }] }],
    ['missing specs', { specs: undefined }],
  ])(
    'treats a product with %s as an error, not as "not found"',
    async (_, broken) => {
      apiClientMock.mockResolvedValue({ ...productDetail(), ...broken });

      await expect(apiProductRepository.findById('MAIN')).rejects.toThrow(
        InvalidApiResponseError,
      );
    },
  );

  it('returns null for an unknown product so the page can show "not found"', async () => {
    apiClientMock.mockRejectedValue(new NotFoundError('/products/NOPE'));

    await expect(apiProductRepository.findById('NOPE')).resolves.toBeNull();
  });

  it('lets other API failures surface instead of pretending the product does not exist', async () => {
    apiClientMock.mockRejectedValue(new Error('timeout'));

    await expect(apiProductRepository.findById('MAIN')).rejects.toThrow(
      'timeout',
    );
  });

  it('escapes the id so a crafted URL cannot reach another API path', async () => {
    apiClientMock.mockResolvedValue(productDetail());

    await apiProductRepository.findById('../admin');

    expect(apiClientMock).toHaveBeenCalledWith('/products/..%2Fadmin');
  });
});
