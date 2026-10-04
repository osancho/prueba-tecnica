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
import type { CartChanges } from '@/core/cart/domain/cart-changes';
import {
  cartTotal,
  type CartLine,
  type NewCartLine,
} from '@/core/cart/domain/cart-line';
import { cartReducer, type CartAction } from '@/core/cart/domain/cart-reducer';
import { localStorageCartRepository as cartRepository } from '@/core/cart/infrastructure/local-storage-cart-repository';

interface CartContextValue {
  lines: CartLine[];
  /** False until the stored cart is read, so views don't flash an empty cart. */
  isRestored: boolean;
  count: number;
  total: number;
  add: (line: NewCartLine) => void;
  remove: (lineId: string) => void;
  applyChanges: (changes: CartChanges) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// crypto.randomUUID only exists on HTTPS and localhost; getRandomValues works on plain HTTP too.
function newLineId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

// Another tab may have changed the saved cart since this one last read it, so each change is
// applied to the saved lines and this tab shows the result. Without storage, the change is
// applied to the lines in memory, which then hold the cart for this visit.
function applyToSavedCart(action: CartAction): CartAction {
  const saved = cartRepository.update((stored) => cartReducer(stored, action));
  return saved ? { type: 'restore', lines: saved } : action;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, []);
  // Read after mount so the server and the first client render agree on an empty cart.
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    dispatch({ type: 'restore', lines: cartRepository.load() });
    setIsRestored(true);
    return cartRepository.subscribe((saved) =>
      dispatch({ type: 'restore', lines: saved }),
    );
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      isRestored,
      count: lines.length,
      total: cartTotal(lines),
      add: (line) =>
        dispatch(
          applyToSavedCart({
            type: 'add',
            line: { ...line, lineId: newLineId() },
          }),
        ),
      remove: (lineId) =>
        dispatch(applyToSavedCart({ type: 'remove', lineId })),
      applyChanges: (changes) =>
        dispatch(applyToSavedCart({ type: 'apply-changes', changes })),
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
