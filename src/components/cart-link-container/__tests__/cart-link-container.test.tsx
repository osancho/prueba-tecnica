import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CartProvider } from '@/context/cart/cart-context';
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

const cartLink = (
  <CartProvider>
    <CartLinkContainer />
  </CartProvider>
);

describe('CartLinkContainer', () => {
  afterEach(() => {
    localStorage.clear();
    pathname.current = '/';
  });

  it('shows no count before the saved cart is read, so the page never says a wrong number', () => {
    localStorage.setItem('mbst-cart', JSON.stringify([pixelLine]));

    expect(renderToString(cartLink)).not.toContain('in the cart');
  });

  it('shows the saved count once the cart is read', async () => {
    localStorage.setItem('mbst-cart', JSON.stringify([pixelLine]));

    render(cartLink);

    expect(
      await screen.findByRole('link', { name: '1 product in the cart' }),
    ).toBeInTheDocument();
  });

  // CSS keeps it visible only on tablet, as the Figma cart frames show it.
  it('keeps the bag on the cart page even with an empty cart', async () => {
    pathname.current = '/cart';

    render(cartLink);

    expect(
      await screen.findByRole('link', { name: '0 products in the cart' }),
    ).toBeInTheDocument();
  });
});
