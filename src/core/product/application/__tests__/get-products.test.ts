import { describe, expect, it } from 'vitest';
import type { ProductListItem } from '../../domain/product';
import type { ProductRepository } from '../../domain/product-repository';
import { getProducts } from '../get-products';

function phone(index: number): ProductListItem {
  return {
    id: `P${index}`,
    brand: 'Brand',
    name: index % 2 === 0 ? `Even ${index}` : `Odd ${index}`,
    basePrice: 100,
    imageUrl: `/api/images/P${index}.webp`,
  };
}

function catalogOf(size: number): ProductRepository {
  const phones = Array.from({ length: size }, (_, index) => phone(index));

  return {
    list: async ({ search = '', limit }) =>
      phones.filter(({ name }) => name.includes(search)).slice(0, limit),
    findById: async () => null,
  };
}

describe('getProducts', () => {
  it('shows the first 20 phones of the catalog', async () => {
    const products = await getProducts(catalogOf(24));

    expect(products.map(({ id }) => id)).toEqual(
      Array.from({ length: 20 }, (_, index) => `P${index}`),
    );
  });

  it('shows every phone a search finds, even when they are more than 20', async () => {
    const products = await getProducts(catalogOf(50), 'Even');

    expect(products).toHaveLength(25);
  });
});
