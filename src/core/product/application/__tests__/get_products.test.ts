import { describe, expect, it, vi } from 'vitest';
import type { ProductListItem } from '../../domain/product';
import type { ProductRepository } from '../../domain/product_repository';
import { getProducts, PRODUCT_LIST_SIZE } from '../get_products';

function phone(id: string): ProductListItem {
  return {
    id,
    brand: 'Brand',
    name: `Phone ${id}`,
    basePrice: 100,
    imageUrl: `/api/images/${id}.webp`,
  };
}

function repositoryWith(phones: ProductListItem[]) {
  return {
    list: vi.fn(async () => phones),
    findById: vi.fn(),
  } satisfies ProductRepository;
}

describe('getProducts', () => {
  it('fills the catalog with 20 different phones even when the source repeats one', async () => {
    const ids = Array.from({ length: 24 }, (_, index) => `P${index}`);
    const repository = repositoryWith([phone('P0'), ...ids.map(phone)]);

    const products = await getProducts(repository);

    expect(products.map(({ id }) => id)).toEqual(
      ids.slice(0, PRODUCT_LIST_SIZE),
    );
  });

  it('asks for extra phones so duplicates never leave the list short', async () => {
    const repository = repositoryWith([]);

    await getProducts(repository, 'galaxy');

    expect(repository.list).toHaveBeenCalledWith({
      search: 'galaxy',
      limit: 40,
    });
  });
});
