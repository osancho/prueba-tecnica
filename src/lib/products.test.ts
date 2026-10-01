// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import type { Product, ProductListItem } from '@/types/product';
import { apiClient } from './apiClient';
import { NotFoundError } from './apiErrors';
import { getProduct, getProducts, PRODUCT_LIST_SIZE } from './products';

vi.mock('./apiClient', () => ({ apiClient: vi.fn() }));

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

describe('getProducts', () => {
  it('fills the catalog with 20 different phones even when the API repeats one', async () => {
    const ids = Array.from({ length: 24 }, (_, index) => `P${index}`);
    apiClientMock.mockResolvedValue([phone('P0'), ...ids.map(phone)]);

    const products = await getProducts();

    expect(products).toHaveLength(PRODUCT_LIST_SIZE);
    expect(new Set(products.map(({ id }) => id)).size).toBe(PRODUCT_LIST_SIZE);
    expect(products.map(({ id }) => id)).toEqual(ids.slice(0, 20));
  });

  it('serves every phone picture through the image normalizer of our own domain', async () => {
    apiClientMock.mockResolvedValue([phone('P1')]);

    const [product] = await getProducts();

    expect(product.imageUrl).toBe('/api/images/P1.webp?v=2');
  });

  it('forwards the search term to the API', async () => {
    apiClientMock.mockResolvedValue([]);

    await getProducts('galaxy');

    expect(apiClientMock).toHaveBeenCalledWith(
      '/products',
      expect.objectContaining({ search: 'galaxy' }),
    );
  });
});

describe('getProduct', () => {
  it('shows each similar product only once, every picture normalized', async () => {
    apiClientMock.mockResolvedValue(
      productDetail({
        similarProducts: [phone('S1'), phone('S2'), phone('S1')],
      }),
    );

    const product = await getProduct('MAIN');

    expect(product?.similarProducts.map(({ id }) => id)).toEqual(['S1', 'S2']);
    expect(product?.similarProducts[0].imageUrl).toBe(
      '/api/images/S1.webp?v=2',
    );
    expect(product?.colorOptions[0].imageUrl).toBe(
      '/api/images/MAIN-black.webp?v=2',
    );
  });

  it('returns null for an unknown product so the page can show "not found"', async () => {
    apiClientMock.mockRejectedValue(new NotFoundError('/products/NOPE'));

    await expect(getProduct('NOPE')).resolves.toBeNull();
  });

  it('lets other API failures surface instead of pretending the product does not exist', async () => {
    apiClientMock.mockRejectedValue(new Error('timeout'));

    await expect(getProduct('MAIN')).rejects.toThrow('timeout');
  });

  it('escapes the id so a crafted URL cannot reach another API path', async () => {
    apiClientMock.mockResolvedValue(productDetail());

    await getProduct('../admin');

    expect(apiClientMock).toHaveBeenCalledWith('/products/..%2Fadmin');
  });
});
