import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CartProvider } from '@/context/cart/cart-context';
import { inMemoryCartRepository } from '@/core/cart/domain/__mocks__/in-memory-cart-repository';
import type { CartLine } from '@/core/cart/domain/cart-line';
import { CartLinkContainer } from '../cart-link-container';

const pathname = vi.hoisted(() => ({ current: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }));

const pixelLine = {
  lineId: 'line-1',
  id: 'GPX-8A',
  brand: 'Google',
  name: 'Pixel 8a',
  imageUrl: '/api/images/GPX-8A-obsidiana.webp',
  colorName: 'Obsidiana',
  capacity: '128 GB',
  price: 459,
};

const cartLinkWith = (lines: CartLine[]) => (
  <CartProvider
    cartRepository={inMemoryCartRepository(lines)}
    productRepository={{ findById: vi.fn() }}
  >
    <CartLinkContainer />
  </CartProvider>
);

describe('CartLinkContainer', () => {
  afterEach(() => {
    pathname.current = '/';
  });

  it('shows no count before the saved cart is read, so the page never says a wrong number', () => {
    expect(renderToString(cartLinkWith([pixelLine]))).not.toContain(
      'in the cart',
    );
  });

  it('shows the saved count once the cart is read', async () => {
    render(cartLinkWith([pixelLine]));

    expect(
      await screen.findByRole('link', { name: '1 product in the cart' }),
    ).toBeInTheDocument();
  });

  // CSS keeps it visible only on tablet, as the Figma cart frames show it.
  it('keeps the bag on the cart page even with an empty cart', async () => {
    pathname.current = '/cart';

    render(cartLinkWith([]));

    expect(
      await screen.findByRole('link', { name: '0 products in the cart' }),
    ).toBeInTheDocument();
  });
});
