import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CartLinkContainer } from '@/components/cart-link-container/cart-link-container';
import type { CartLine, NewCartLine } from '@/core/cart/domain/cart-line';
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

const savedPixel = (lineId: string): CartLine => ({ ...pixel, lineId });

function savedLineIds(): string[] {
  return JSON.parse(localStorage.getItem('mbst-cart') ?? '[]').map(
    (line: CartLine) => line.lineId,
  );
}

/** Writes the cart as another tab does; the browser tells this tab only through events. */
function saveFromAnotherTab(lines: CartLine[]) {
  localStorage.setItem('mbst-cart', JSON.stringify(lines));
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

  describe('with the cart open in other tabs', () => {
    it('shows a phone added in another tab without reloading', async () => {
      renderCart();
      await screen.findByRole('link', { name: '0 products in the cart' });

      saveFromAnotherTab([savedPixel('other-tab')]);
      fireEvent(window, new StorageEvent('storage', { key: 'mbst-cart' }));

      expect(
        screen.getByRole('link', { name: '1 product in the cart' }),
      ).toBeInTheDocument();
    });

    it('keeps the phone another tab added when this tab adds one before hearing about it', async () => {
      renderCart();
      saveFromAnotherTab([savedPixel('other-tab')]);

      await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));

      expect(
        screen.getByRole('link', { name: '2 products in the cart' }),
      ).toBeInTheDocument();
      expect(savedLineIds()).toContain('other-tab');
    });

    it('never brings back a phone another tab removed', async () => {
      saveFromAnotherTab([savedPixel('removed'), savedPixel('kept')]);
      renderCart();
      await screen.findByRole('link', { name: '2 products in the cart' });
      saveFromAnotherTab([savedPixel('kept')]);

      await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));

      expect(savedLineIds()).not.toContain('removed');
      expect(
        screen.getByRole('link', { name: '2 products in the cart' }),
      ).toBeInTheDocument();
    });

    it('shows the saved cart again when the page comes back from the back/forward cache', async () => {
      renderCart();
      await screen.findByRole('link', { name: '0 products in the cart' });
      saveFromAnotherTab([savedPixel('while-away')]);

      fireEvent(
        window,
        new PageTransitionEvent('pageshow', { persisted: true }),
      );

      expect(
        screen.getByRole('link', { name: '1 product in the cart' }),
      ).toBeInTheDocument();
    });

    it('never writes the cart back just because another tab changed it', async () => {
      renderCart();
      await screen.findByRole('link', { name: '0 products in the cart' });
      saveFromAnotherTab([savedPixel('other-tab')]);
      const setItem = vi.spyOn(Storage.prototype, 'setItem');

      fireEvent(window, new StorageEvent('storage', { key: 'mbst-cart' }));

      expect(setItem).not.toHaveBeenCalled();
    });
  });

  it('keeps the cart working for the visit when the browser blocks storage', async () => {
    const blocked = () => {
      throw new DOMException('Access is denied', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    renderCart();

    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add Pixel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove first' }));

    expect(
      screen.getByRole('link', { name: '1 product in the cart' }),
    ).toBeInTheDocument();
  });
});
