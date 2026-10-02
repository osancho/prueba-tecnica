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
import {
  cartTotal,
  type CartLine,
  type NewCartLine,
} from '@/core/cart/domain/cart_line';
import { cartReducer } from '@/core/cart/domain/cart_reducer';
import { localStorageCartRepository as cartRepository } from '@/core/cart/infrastructure/local_storage_cart_repository';

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, []);
  // Read after mount so the server and the first client render agree on an empty cart.
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    dispatch({ type: 'restore', lines: cartRepository.load() });
    setIsRestored(true);
  }, []);

  useEffect(() => {
    if (isRestored) cartRepository.save(lines);
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
