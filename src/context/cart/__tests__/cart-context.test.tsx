import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CartLinkContainer } from '@/components/cart-link-container/cart-link-container';
import { inMemoryCartRepository } from '@/core/cart/domain/__mocks__/in-memory-cart-repository';
import type { CartLine, NewCartLine } from '@/core/cart/domain/cart-line';
import type { CartRepository } from '@/core/cart/domain/cart-repository';
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
  const { add, remove, lines, total } = useCart();
  return (
    <>
      <button onClick={() => add(pixel)}>Add Pixel</button>
      <button onClick={() => remove(lines[0].lineId)}>Remove first</button>
      <output aria-label="Total">{total}</output>
    </>
  );
}

function renderCart(cartRepository: CartRepository = inMemoryCartRepository()) {
  render(
    <CartProvider
      cartRepository={cartRepository}
      productRepository={{ findById: vi.fn() }}
    >
      <CartLinkContainer />
      <AddPixel />
    </CartProvider>,
  );
}

describe('CartProvider', () => {
  it('shows how many phones the user added in the navbar', async () => {
    renderCart();

    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));

    expect(
      screen.getByRole('link', { name: '2 products in the cart' }),
    ).toBeInTheDocument();
  });

  it('adds and removes phones where the browser offers no randomUUID (plain HTTP)', async () => {
    vi.stubGlobal('crypto', {
      getRandomValues: crypto.getRandomValues.bind(crypto),
    });
    renderCart();

    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove first' }));

    expect(
      screen.getByRole('link', { name: '1 product in the cart' }),
    ).toBeInTheDocument();
  });

  it('adds prices with cents without rounding errors', () => {
    const saved: CartLine[] = [1229.1, 1229.1, 1229.1, 0.1, 0.2].map(
      (price, index) => ({ ...pixel, lineId: `line-${index}`, price }),
    );

    renderCart(inMemoryCartRepository(saved));

    expect(screen.getByRole('status', { name: 'Total' })).toHaveTextContent(
      /^3687\.6$/,
    );
  });

  it('shows a phone added in another tab without reloading', async () => {
    const cartRepository = inMemoryCartRepository();
    renderCart(cartRepository);
    await screen.findByRole('link', { name: '0 products in the cart' });

    act(() => cartRepository.changeFromOutside([{ ...pixel, lineId: 'tab' }]));

    expect(
      screen.getByRole('link', { name: '1 product in the cart' }),
    ).toBeInTheDocument();
  });

  it('keeps the cart working for the visit when it cannot be saved', async () => {
    renderCart({ ...inMemoryCartRepository(), update: () => null });

    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove first' }));

    expect(
      screen.getByRole('link', { name: '1 product in the cart' }),
    ).toBeInTheDocument();
  });
});
