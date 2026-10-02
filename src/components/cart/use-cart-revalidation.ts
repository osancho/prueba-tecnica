import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/cart/cart-context';
import { revalidateCart } from '@/core/cart/application/revalidate-cart';
import type { CartChanges } from '@/core/cart/domain/cart-changes';
import { httpProductRepository } from '@/core/product/infrastructure/http-product-repository';

/**
 * Checks the saved cart against the catalog once, when the cart opens, and returns what changed
 * so the page can tell the user. Null until the check ends or when there was nothing to check.
 */
export function useCartRevalidation(): CartChanges | null {
  const { lines, isRestored, applyChanges } = useCart();
  const [changes, setChanges] = useState<CartChanges | null>(null);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!isRestored || hasChecked.current || lines.length === 0) return;
    hasChecked.current = true;

    // Never rejects: lines it cannot check are kept. `void` rather than a catch, so a real bug
    // would still surface as an unhandled rejection instead of being swallowed.
    void revalidateCart(lines, httpProductRepository).then((found) => {
      applyChanges(found);
      setChanges(found);
    });
  }, [isRestored, lines, applyChanges]);

  return changes;
}
