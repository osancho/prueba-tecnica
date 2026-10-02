import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartLinkContainer } from '@/components/cart_link_container/cart_link_container';
import { CartProvider } from '@/context/cart/cart_context';
import { ProductDetail } from '../product_detail';
import { galaxy } from '@/core/product/domain/__mocks__/product_fixture';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => window.location.pathname,
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

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
  beforeEach(() => window.history.replaceState(null, '', '/product/SMG-S24U'));

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

  it('opens a shared link with the storage and color already chosen', () => {
    window.history.replaceState(
      null,
      '',
      '/product/SMG-S24U?storage=512+GB&color=Titanium+Black',
    );

    renderDetail();

    expect(screen.getByRole('radio', { name: '512 GB' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Titanium Black' })).toBeChecked();
    expect(screen.getByText('1329 EUR')).toBeInTheDocument();
    expect(addButton()).toBeEnabled();
  });

  it('keeps the chosen options in the address so the user can share them', async () => {
    renderDetail();

    await userEvent.click(screen.getByRole('radio', { name: '256 GB' }));
    await userEvent.click(
      screen.getByRole('radio', { name: 'Titanium Black' }),
    );

    expect(window.location.search).toBe('?storage=256+GB&color=Titanium+Black');
  });

  it('ignores options in the link that the phone does not have', () => {
    window.history.replaceState(
      null,
      '',
      '/product/SMG-S24U?storage=2+TB&color=Pink',
    );

    renderDetail();

    expect(screen.getByText('From 1229 EUR')).toBeInTheDocument();
    expect(addButton()).toBeDisabled();
    expect(window.location.search).toBe('');
  });
});
