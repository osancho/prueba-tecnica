import { describe, expect, it } from 'vitest';
import type { CartLine } from '@/types/cart';
import { cartReducer } from './cartReducer';

const blackGalaxy: CartLine = {
  lineId: 'line-1',
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  imageUrl: '/api/images/SMG-S24U-titanium-black.webp',
  colorName: 'Titanium Black',
  capacity: '256 GB',
  price: 1229,
};

describe('cartReducer', () => {
  it('adds a phone as a new line', () => {
    const lines = cartReducer([], { type: 'add', line: blackGalaxy });

    expect(lines).toEqual([blackGalaxy]);
  });

  it('shows the same phone twice when the user adds it twice', () => {
    const again = { ...blackGalaxy, lineId: 'line-2' };

    const once = cartReducer([], { type: 'add', line: blackGalaxy });
    const twice = cartReducer(once, { type: 'add', line: again });

    expect(twice).toEqual([blackGalaxy, again]);
  });

  it('removes only the line the user deletes, even if another one is identical', () => {
    const again = { ...blackGalaxy, lineId: 'line-2' };

    const lines = cartReducer([blackGalaxy, again], {
      type: 'remove',
      lineId: 'line-1',
    });

    expect(lines).toEqual([again]);
  });

  it('restores a saved cart as it was', () => {
    const saved = [blackGalaxy];

    expect(cartReducer([], { type: 'restore', lines: saved })).toBe(saved);
  });
});
