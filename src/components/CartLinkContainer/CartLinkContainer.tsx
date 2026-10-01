'use client';

import { CartLink } from '@/components/CartLink/CartLink';
import { useCart } from '@/context/cart/CartContext';

export function CartLinkContainer() {
  return <CartLink count={useCart().count} />;
}
