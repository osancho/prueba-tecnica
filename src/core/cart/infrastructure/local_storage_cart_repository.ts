import { isCartLine } from '../domain/cart_line';
import type { CartRepository } from '../domain/cart_repository';

const STORAGE_KEY = 'mbst-cart';

/** Keeps the cart in this browser only; nothing about it reaches a server or a cookie. */
export const localStorageCartRepository: CartRepository = {
  // Storage can be blocked (private mode) or hold data from an older version: start empty then.
  load() {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? '[]',
      );
      return Array.isArray(stored) ? stored.filter(isCartLine) : [];
    } catch {
      return [];
    }
  },

  save(lines) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // The cart keeps working for this visit without persistence.
    }
  },
};
