import { describe, expect, it, vi } from 'vitest';
import type { ProductListItem } from '../../domain/product';
import type { ProductRepository } from '../../domain/product-repository';
import { getProducts, PRODUCT_LIST_SIZE } from '../get-products';

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

    await getProducts(repository);

    expect(repository.list).toHaveBeenCalledWith({
      search: undefined,
      limit: 40,
    });
  });

  it('shows every different phone a search finds, even when they are more than 20', async () => {
    const ids = Array.from({ length: 21 }, (_, index) => `P${index}`);
    const repository = repositoryWith([phone('P0'), ...ids.map(phone)]);

    const products = await getProducts(repository, 'a');

    expect(repository.list).toHaveBeenCalledWith({ search: 'a', limit: 40 });
    expect(products.map(({ id }) => id)).toEqual(ids);
  });
});
