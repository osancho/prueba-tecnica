import { describe, expect, it, vi } from 'vitest';
import { galaxy } from '@/core/product/domain/__mocks__/product-fixture';
import type { Product } from '@/core/product/domain/product';
import type { CartLine } from '../../domain/cart-line';
import { revalidateCart } from '../revalidate-cart';

function lineOf(lineId: string, changes: Partial<CartLine> = {}): CartLine {
  return {
    lineId,
    id: galaxy.id,
    brand: galaxy.brand,
    name: galaxy.name,
    imageUrl: galaxy.colorOptions[0].imageUrl,
    colorName: galaxy.colorOptions[0].name,
    capacity: galaxy.storageOptions[0].capacity,
    price: galaxy.storageOptions[0].price,
    ...changes,
  };
}

function catalogWith(products: Record<string, Product | null | Error>) {
  return {
    findById: vi.fn(async (id: string) => {
      const product = products[id];
      if (product instanceof Error) throw product;
      return product ?? null;
    }),
  };
}

describe('revalidateCart', () => {
  it('changes nothing when every phone is still sold at the same price', async () => {
    const changes = await revalidateCart(
      [lineOf('a')],
      catalogWith({ [galaxy.id]: galaxy }),
    );

    expect(changes).toEqual({ unavailable: [], repriced: {} });
  });

  it('gives a line the current price of its storage', async () => {
    const changes = await revalidateCart(
      [lineOf('a', { price: 1 })],
      catalogWith({ [galaxy.id]: galaxy }),
    );

    expect(changes.repriced).toEqual({ a: galaxy.storageOptions[0].price });
  });

  it('flags lines whose phone, storage or color can no longer be bought', async () => {
    const changes = await revalidateCart(
      [
        lineOf('gone', { id: 'NOPE' }),
        lineOf('storage', { capacity: '2 TB' }),
        lineOf('color', { colorName: 'Gold' }),
        lineOf('fine'),
      ],
      catalogWith({ [galaxy.id]: galaxy, NOPE: null }),
    );

    expect(changes.unavailable).toEqual(['gone', 'storage', 'color']);
  });

  it('keeps lines it could not check, so a network failure never empties the cart', async () => {
    const changes = await revalidateCart(
      [lineOf('a', { price: 1 })],
      catalogWith({ [galaxy.id]: new Error('offline') }),
    );

    expect(changes).toEqual({ unavailable: [], repriced: {} });
  });

  it('asks for each phone once, however many lines it has', async () => {
    const catalog = catalogWith({ [galaxy.id]: galaxy });

    await revalidateCart([lineOf('a'), lineOf('b')], catalog);

    expect(catalog.findById).toHaveBeenCalledOnce();
  });
});
