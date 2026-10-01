import { describe, expect, it } from 'vitest';
import type { CartLine, NewCartLine } from '@/types/cart';
import { cartLineKey, cartReducer } from './cartReducer';

const blackGalaxy: NewCartLine = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  imageUrl: '/api/images/SMG-S24U-titanium-black.webp',
  colorName: 'Titanium Black',
  capacity: '256 GB',
  price: 1229,
};

describe('cartReducer', () => {
  it('adds a new phone as a line with one unit', () => {
    const lines = cartReducer([], { type: 'add', line: blackGalaxy });

    expect(lines).toEqual([{ ...blackGalaxy, quantity: 1 }]);
  });

  it('adds another unit when the same phone, color and storage is added again', () => {
    const once = cartReducer([], { type: 'add', line: blackGalaxy });
    const twice = cartReducer(once, { type: 'add', line: blackGalaxy });

    expect(twice).toEqual([{ ...blackGalaxy, quantity: 2 }]);
  });

  it('keeps a different color or storage of the same phone as its own line', () => {
    const violet = { ...blackGalaxy, colorName: 'Titanium Violet' };
    const bigger = { ...blackGalaxy, capacity: '512 GB', price: 1329 };

    const lines = [blackGalaxy, violet, bigger].reduce(
      (cart, line) => cartReducer(cart, { type: 'add', line }),
      [] as CartLine[],
    );

    expect(lines).toHaveLength(3);
  });

  it('removes only the line the user deletes', () => {
    const violet = { ...blackGalaxy, colorName: 'Titanium Violet' };
    const cart = [blackGalaxy, violet].reduce(
      (lines, line) => cartReducer(lines, { type: 'add', line }),
      [] as CartLine[],
    );

    const lines = cartReducer(cart, {
      type: 'remove',
      key: cartLineKey(blackGalaxy),
    });

    expect(lines).toEqual([{ ...violet, quantity: 1 }]);
  });

  it('restores a saved cart as it was', () => {
    const saved = [{ ...blackGalaxy, quantity: 3 }];

    expect(cartReducer([], { type: 'restore', lines: saved })).toBe(saved);
  });
});
