import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CartProvider } from '@/context/cart/cart-context';
import { httpProductRepository } from '@/core/product/infrastructure/http-product-repository';
import CartPage, { metadata } from '../page';

vi.mock('@/core/product/infrastructure/http-product-repository', () => ({
  httpProductRepository: { findById: vi.fn() },
}));

function renderCartPage() {
  return render(
    <CartProvider>
      <CartPage />
    </CartProvider>,
  );
}

describe('CartPage', () => {
  // Offline: the saved cart is shown as it was.
  beforeEach(() => {
    vi.mocked(httpProductRepository.findById).mockRejectedValue(
      new Error('offline'),
    );
  });
  afterEach(() => localStorage.clear());

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

  it.each([
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
    localStorage.setItem('mbst-cart', JSON.stringify(lines));
    const { container } = renderCartPage();
    await screen.findByRole('heading', { level: 1 });

    expect(await axe(container)).toHaveNoViolations();
  });
});
