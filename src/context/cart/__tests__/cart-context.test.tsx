import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { CartLinkContainer } from '@/components/cart-link-container/cart-link-container';
import type { NewCartLine } from '@/core/cart/domain/cart-line';
import { CartProvider, useCart } from '../cart-context';

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
    localStorage.setItem(
      'mbst-cart',
      JSON.stringify([
        { ...pixel, lineId: 'a' },
        { ...pixel, lineId: 'b' },
        { ...pixel, lineId: 'c', price: -1 },
        { ...pixel, lineId: 'd', price: '459' },
        pixel,
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
        { ...pixel, lineId: 'a', price: 1229.1 },
        { ...pixel, lineId: 'b', price: 1229.1 },
        { ...pixel, lineId: 'c', price: 1229.1 },
        { ...pixel, lineId: 'd', price: 0.1 },
        { ...pixel, lineId: 'e', price: 0.2 },
      ]),
    );

    renderCart();

    expect(screen.getByRole('status', { name: 'Total' })).toHaveTextContent(
      /^3687\.6$/,
    );
  });
});
