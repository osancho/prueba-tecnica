'use client';

import { usePathname } from 'next/navigation';
import { CartLink } from '@/components/cart-link/cart-link';
import { useCart } from '@/context/cart/cart-context';
import './cart-link-container.css';

export function CartLinkContainer() {
  const { count } = useCart();
  const isCartPage = usePathname() === '/cart';

  if (isCartPage && count === 0) return null;
  return (
    <div className={isCartPage ? 'cart-link-container--cart-page' : undefined}>
      <CartLink count={count} />
    </div>
  );
}
