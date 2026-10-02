import { describe, expect, it } from 'vitest';
import type { CartLine } from '../cart-line';
import { cartReducer } from '../cart-reducer';

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

  it('drops unavailable lines and reprices the rest after checking the catalog', () => {
    const again = { ...blackGalaxy, lineId: 'line-2' };

    const lines = cartReducer([blackGalaxy, again], {
      type: 'apply-changes',
      changes: { unavailable: ['line-1'], repriced: { 'line-2': 1199 } },
    });

    expect(lines).toEqual([{ ...again, price: 1199 }]);
  });

  it('keeps a line removed while the catalog was being checked removed', () => {
    const lines = cartReducer([], {
      type: 'apply-changes',
      changes: { unavailable: [], repriced: { 'line-1': 1199 } },
    });

    expect(lines).toEqual([]);
  });

  it('restores a saved cart as it was', () => {
    const saved = [blackGalaxy];

    expect(cartReducer([], { type: 'restore', lines: saved })).toBe(saved);
  });
});
