import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CartProvider } from '@/context/cart/cart_context';
import { CartLinkContainer } from '../cart_link_container';

vi.mock('next/navigation', () => ({ usePathname: () => '/cart' }));

function renderOnCartPage() {
  render(
    <CartProvider>
      <CartLinkContainer />
    </CartProvider>,
  );
}

describe('CartLinkContainer', () => {
  afterEach(() => localStorage.clear());

  it('hides the bag on the cart page while the cart is empty', () => {
    renderOnCartPage();

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('keeps the bag on the cart page once it holds products', async () => {
    localStorage.setItem(
      'mbst-cart',
      JSON.stringify([
        {
          lineId: 'line-1',
          id: 'GPX-8A',
          brand: 'Google',
          name: 'Pixel 8a',
          imageUrl: '/api/images/GPX-8A-obsidiana.webp',
          colorName: 'Obsidiana',
          capacity: '128 GB',
          price: 459,
        },
      ]),
    );

    renderOnCartPage();

    expect(
      await screen.findByRole('link', { name: '1 product in the cart' }),
    ).toBeInTheDocument();
  });
});
