'use client';

import { usePathname } from 'next/navigation';
import { CartLink } from '@/components/cart_link/cart_link';
import { useCart } from '@/context/cart/cart_context';
import './cart_link_container.css';

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
