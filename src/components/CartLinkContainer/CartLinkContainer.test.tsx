import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CartProvider } from '@/context/cart/CartContext';
import { CartLinkContainer } from './CartLinkContainer';

vi.mock('next/navigation', () => ({ usePathname: () => '/cart' }));

describe('CartLinkContainer', () => {
  it('hides the bag on the cart page while the cart is empty', () => {
    render(
      <CartProvider>
        <CartLinkContainer />
      </CartProvider>,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
