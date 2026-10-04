import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CartProvider } from '@/context/cart/cart-context';
import { inMemoryCartRepository } from '@/core/cart/domain/__mocks__/in-memory-cart-repository';
import type { CartLine } from '@/core/cart/domain/cart-line';
import CartPage, { metadata } from '../page';

// Offline: the saved cart is shown as it was.
const offlineCatalog = {
  findById: () => Promise.reject(new Error('offline')),
};

function renderCartPage(lines: CartLine[] = []) {
  return render(
    <CartProvider
      cartRepository={inMemoryCartRepository(lines)}
      productRepository={offlineCatalog}
    >
      <CartPage />
    </CartProvider>,
  );
}

describe('CartPage', () => {
  it('shows the cart under its own title', async () => {
    renderCartPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cart (0)' }),
    ).toBeInTheDocument();
    expect(metadata.title).toBe('Cart');
  });

  it('keeps the cart out of search results, since it is personal', () => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it.each<[string, CartLine[]]>([
    ['empty', []],
    [
      'with phones',
      [
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
      ],
    ],
  ])('has no accessibility violations %s', async (_, lines) => {
    const { container } = renderCartPage(lines);
    await screen.findByRole('heading', { level: 1 });

    expect(await axe(container)).toHaveNoViolations();
  });
});
