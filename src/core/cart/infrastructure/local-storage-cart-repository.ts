import { isCartLine, type CartLine } from '../domain/cart-line';
import type { CartRepository } from '../domain/cart-repository';

const STORAGE_KEY = 'mbst-cart';

// Stored data can come from an older version or be edited by hand: anything invalid is dropped.
function parseCart(stored: string | null): CartLine[] {
  try {
    const lines: unknown = JSON.parse(stored ?? '[]');
    return Array.isArray(lines) ? lines.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

// Storage can be blocked (private mode): start empty then.
function loadSavedCart(): CartLine[] {
  try {
    return parseCart(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/** Keeps the cart in this browser only; nothing about it reaches a server or a cookie. */
export const localStorageCartRepository: CartRepository = {
  load: loadSavedCart,

  update(change) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const lines = change(parseCart(stored));
      const serialized = JSON.stringify(lines);
      if (serialized !== stored) localStorage.setItem(STORAGE_KEY, serialized);
      return lines;
    } catch {
      return null;
    }
  },

  subscribe(onChange) {
    // Another tab wrote the cart (a null key means it cleared all storage).
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        onChange(loadSavedCart());
    };
    // A page restored from the back/forward cache missed every event while it was frozen.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) onChange(loadSavedCart());
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pageshow', onPageShow);
    };
  },
};
