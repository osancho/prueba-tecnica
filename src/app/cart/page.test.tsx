import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CartProvider } from '@/context/cart/CartContext';
import CartPage, { metadata } from './page';

describe('CartPage', () => {
  it('shows the cart under its own title', async () => {
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>,
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cart (0)' }),
    ).toBeInTheDocument();
    expect(metadata.title).toBe('Cart');
  });

  it('keeps the cart out of search results, since it is personal', () => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
