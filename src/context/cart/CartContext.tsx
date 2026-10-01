'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type { CartLine, NewCartLine } from '@/types/cart';
import { cartTotal, isCartLine } from './cartLine';
import { cartReducer } from './cartReducer';

const STORAGE_KEY = 'mbst-cart';

interface CartContextValue {
  lines: CartLine[];
  /** False until the stored cart is read, so views don't flash an empty cart. */
  isRestored: boolean;
  count: number;
  total: number;
  add: (line: NewCartLine) => void;
  remove: (lineId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// Storage can be blocked (private mode) or hold data from an older version: start empty then.
function readStoredCart(): CartLine[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]',
    );
    return Array.isArray(stored) ? stored.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

function storeCart(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // The cart keeps working for this visit without persistence.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, []);
  // Read after mount so the server and the first client render agree on an empty cart.
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    dispatch({ type: 'restore', lines: readStoredCart() });
    setIsRestored(true);
  }, []);

  useEffect(() => {
    if (isRestored) storeCart(lines);
  }, [lines, isRestored]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      isRestored,
      count: lines.length,
      total: cartTotal(lines),
      add: (line) =>
        dispatch({
          type: 'add',
          line: { ...line, lineId: crypto.randomUUID() },
        }),
      remove: (lineId) => dispatch({ type: 'remove', lineId }),
    }),
    [lines, isRestored],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart must be used inside CartProvider');
  return cart;
}
