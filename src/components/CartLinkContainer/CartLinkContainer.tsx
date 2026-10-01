'use client';

import { usePathname } from 'next/navigation';
import { CartLink } from '@/components/CartLink/CartLink';
import { useCart } from '@/context/cart/CartContext';
import './CartLinkContainer.css';

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
