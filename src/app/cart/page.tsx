import type { Metadata } from 'next';
import { Cart } from '@/components/cart/cart';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review the smartphones in your cart before paying.',
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <main>
      <Cart />
    </main>
  );
}
