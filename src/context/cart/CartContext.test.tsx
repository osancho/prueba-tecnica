import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { CartLinkContainer } from '@/components/CartLinkContainer/CartLinkContainer';
import type { NewCartLine } from '@/types/cart';
import { CartProvider, useCart } from './CartContext';

const pixel: NewCartLine = {
  id: 'GPX-8A',
  brand: 'Google',
  name: 'Pixel 8a',
  imageUrl: '/api/images/GPX-8A-obsidiana.webp',
  colorName: 'Obsidiana',
  capacity: '128 GB',
  price: 459,
};

function AddPixel() {
  const { add, total } = useCart();
  return (
    <>
      <button onClick={() => add(pixel)}>Add Pixel</button>
      <output aria-label="Total">{total}</output>
    </>
  );
}

function renderCart() {
  render(
    <CartProvider>
      <CartLinkContainer />
      <AddPixel />
    </CartProvider>,
  );
}

describe('CartProvider', () => {
  afterEach(() => localStorage.clear());

  it('shows how many phones the user added in the navbar', async () => {
    renderCart();

    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));

    expect(
      screen.getByRole('link', { name: '2 products in the cart' }),
    ).toBeInTheDocument();
  });

  it('keeps the cart when the user comes back later', async () => {
    renderCart();
    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));

    renderCart();

    expect(
      await screen.findAllByRole('link', { name: '1 product in the cart' }),
    ).toHaveLength(2);
  });

  it('starts with an empty cart when the saved one cannot be read', () => {
    localStorage.setItem('mbst-cart', '{not json');

    renderCart();

    expect(
      screen.getByRole('link', { name: '0 products in the cart' }),
    ).toBeInTheDocument();
  });

  it('ignores saved lines that are not valid phones', () => {
    const valid = { ...pixel, quantity: 2 };
    localStorage.setItem(
      'mbst-cart',
      JSON.stringify([
        valid,
        { ...pixel, quantity: -1 },
        { ...pixel, price: '459' },
        { id: 'GPX-8A' },
        null,
      ]),
    );

    renderCart();

    expect(
      screen.getByRole('link', { name: '2 products in the cart' }),
    ).toBeInTheDocument();
  });

  it('adds prices with cents without rounding errors', () => {
    localStorage.setItem(
      'mbst-cart',
      JSON.stringify([
        { ...pixel, price: 1229.1, quantity: 3 },
        { ...pixel, colorName: 'Porcelana', price: 0.1, quantity: 1 },
        { ...pixel, colorName: 'Celeste', price: 0.2, quantity: 1 },
      ]),
    );

    renderCart();

    expect(screen.getByRole('status', { name: 'Total' })).toHaveTextContent(
      /^3687\.6$/,
    );
  });
});
