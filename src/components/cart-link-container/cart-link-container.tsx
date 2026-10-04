'use client';

import { usePathname } from 'next/navigation';
import { CartLink } from '@/components/cart-link/cart-link';
import { useCart } from '@/context/cart/cart-context';
import './cart-link-container.css';

export function CartLinkContainer() {
  const { count, isRestored } = useCart();
  const isCartPage = usePathname() === '/cart';

  // The count is unknown until the saved cart is read: no bag beats a wrong number.
  if (!isRestored) return null;
  return (
    <div className={isCartPage ? 'cart-link-container--cart-page' : undefined}>
      <CartLink count={count} />
    </div>
  );
}
