import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CartLinkContainer } from '@/components/CartLinkContainer/CartLinkContainer';
import { CartProvider } from '@/context/cart/CartContext';
import { ProductDetail } from './ProductDetail';
import { galaxy } from './productFixture';

const push = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

function renderDetail() {
  render(
    <CartProvider>
      <CartLinkContainer />
      <ProductDetail product={galaxy} />
    </CartProvider>,
  );
}

const addButton = () => screen.getByRole('button', { name: 'Añadir' });

describe('ProductDetail', () => {
  it('keeps "Añadir" disabled until both storage and color are chosen', async () => {
    renderDetail();
    expect(addButton()).toBeDisabled();

    await userEvent.click(screen.getByRole('radio', { name: '256 GB' }));
    expect(addButton()).toBeDisabled();

    await userEvent.click(
      screen.getByRole('radio', { name: 'Titanium Black' }),
    );
    expect(addButton()).toBeEnabled();
  });

  it('shows the lowest price until a storage is chosen, then its price', async () => {
    renderDetail();
    expect(screen.getByText('From 1229 EUR')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: '512 GB' }));

    expect(screen.getByText('1329 EUR')).toBeInTheDocument();
  });

  it('shows the phone in the color the user picks', async () => {
    renderDetail();
    expect(
      screen.getByRole('img', {
        name: 'Samsung Galaxy S24 Ultra in Titanium Violet',
      }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('radio', { name: 'Titanium Black' }),
    );

    expect(
      screen.getByRole('img', {
        name: 'Samsung Galaxy S24 Ultra in Titanium Black',
      }),
    ).toBeInTheDocument();
  });

  it('adds the chosen phone to the cart and opens the cart', async () => {
    renderDetail();

    await userEvent.click(screen.getByRole('radio', { name: '256 GB' }));
    await userEvent.click(
      screen.getByRole('radio', { name: 'Titanium Black' }),
    );
    await userEvent.click(addButton());

    expect(
      screen.getByRole('link', { name: '1 product in the cart' }),
    ).toBeInTheDocument();
    expect(push).toHaveBeenCalledWith('/cart');
  });
});
