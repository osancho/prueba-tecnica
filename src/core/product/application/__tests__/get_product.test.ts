import { describe, expect, it, vi } from 'vitest';
import { galaxy } from '../../domain/__mocks__/product_fixture';
import type { Product, ProductListItem } from '../../domain/product';
import type { ProductRepository } from '../../domain/product_repository';
import { getProduct } from '../get_product';

function phone(id: string): ProductListItem {
  return {
    id,
    brand: 'Brand',
    name: `Phone ${id}`,
    basePrice: 100,
    imageUrl: `/api/images/${id}.webp`,
  };
}

function repositoryWith(product: Product | null) {
  return {
    list: vi.fn(),
    findById: vi.fn(async () => product),
  } satisfies ProductRepository;
}

const main: Product = {
  ...galaxy,
  similarProducts: [phone('S1'), phone('S2'), phone('S1')],
};

describe('getProduct', () => {
  it('shows each similar product only once', async () => {
    const product = await getProduct(repositoryWith(main), 'MAIN');

    expect(product?.similarProducts.map(({ id }) => id)).toEqual(['S1', 'S2']);
  });

  it('returns null for an unknown phone so the page can show "not found"', async () => {
    await expect(getProduct(repositoryWith(null), 'NOPE')).resolves.toBeNull();
  });
});
