import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CartProvider } from '@/context/cart/CartContext';
import type { CartLine } from '@/types/cart';
import { Cart } from './Cart';

const violetGalaxy: CartLine = {
  lineId: 'line-1',
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  imageUrl: '/api/images/SMG-S24U-titanium-violet.webp',
  colorName: 'Titanium Violet',
  capacity: '512 GB',
  price: 1329,
};

const pixel: CartLine = {
  lineId: 'line-2',
  id: 'GPX-8A',
  brand: 'Google',
  name: 'Pixel 8a',
  imageUrl: '/api/images/GPX-8A-obsidiana.webp',
  colorName: 'Obsidiana',
  capacity: '128 GB',
  price: 459,
};

function stubAnimations() {
  const animate = vi.fn(() => ({
    finished: Promise.resolve(),
    cancel: vi.fn(),
  }));
  Object.defineProperty(Element.prototype, 'animate', {
    value: animate,
    configurable: true,
  });
  return animate;
}

const fadeOut = [{ opacity: 1 }, { opacity: 0 }];

function renderCartWith(lines: CartLine[]) {
  localStorage.setItem('mbst-cart', JSON.stringify(lines));
  render(
    <CartProvider>
      <Cart />
    </CartProvider>,
  );
}

describe('Cart', () => {
  afterEach(() => localStorage.clear());

  it('lists every phone with its storage, color and price, and the total', async () => {
    renderCartWith([violetGalaxy, pixel]);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cart (2)' }),
    ).toBeInTheDocument();
    const galaxy = screen.getAllByRole('listitem')[0];
    expect(within(galaxy).getByRole('heading')).toHaveTextContent(
      'Galaxy S24 Ultra',
    );
    expect(galaxy).toHaveTextContent('512 GB | Titanium Violet');
    expect(galaxy).toHaveTextContent('1329 EUR');
    expect(screen.getByText('1788 EUR')).toBeInTheDocument();
  });

  it('removes only the phone the user deletes and updates the total', async () => {
    renderCartWith([violetGalaxy, pixel]);

    await userEvent.click(
      await screen.findByRole('button', { name: /Eliminar Pixel 8a/ }),
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cart (1)' }),
    ).toHaveFocus();
    expect(screen.getByText('1329 EUR', { selector: 'span' })).toBeVisible();
  });

  it('offers only to keep shopping when the cart is empty', async () => {
    renderCartWith([]);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cart (0)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Continue shopping' }),
    ).toHaveAttribute('href', '/');
    expect(
      screen.queryByRole('button', { name: 'Pay' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
  });

  it('fades a removed phone out in place and leaves nothing behind', async () => {
    const animate = stubAnimations();
    renderCartWith([violetGalaxy, pixel]);

    await userEvent.click(
      await screen.findByRole('button', { name: /Eliminar Galaxy S24 Ultra/ }),
    );

    expect(animate).toHaveBeenCalledWith(fadeOut, expect.anything());
    await waitFor(() =>
      expect(document.querySelector('[inert]')).not.toBeInTheDocument(),
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: /Eliminar Pixel 8a/ }),
    ).toBeEnabled();
  });

  it('removes phones without animating when the user prefers reduced motion', async () => {
    const animate = stubAnimations();
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    renderCartWith([violetGalaxy]);

    await userEvent.click(
      await screen.findByRole('button', { name: /Eliminar Galaxy S24 Ultra/ }),
    );

    expect(animate).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cart (0)' }),
    ).toBeInTheDocument();
  });
});
