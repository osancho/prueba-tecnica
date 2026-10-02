import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CartLine } from '@/core/cart/domain/cart-line';
import { CartItem } from '../cart-item';

const line: CartLine = {
  lineId: 'line-1',
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  imageUrl: '/api/images/SMG-S24U-titanium-violet.webp',
  colorName: 'Titanium Violet',
  capacity: '512 GB',
  price: 1329,
};

function renderLine(onRemove = vi.fn()) {
  render(
    <ul>
      <CartItem line={line} onRemove={onRemove} />
    </ul>,
  );
  return onRemove;
}

describe('CartItem', () => {
  it('shows the phone with the storage and color chosen and its price', () => {
    renderLine();

    const item = screen.getByRole('listitem');
    expect(
      screen.getByRole('heading', { name: 'Galaxy S24 Ultra' }),
    ).toBeInTheDocument();
    expect(item).toHaveTextContent('512 GB | Titanium Violet');
    expect(item).toHaveTextContent('1329 EUR');
    expect(
      screen.getByRole('img', {
        name: 'Samsung Galaxy S24 Ultra in Titanium Violet',
      }),
    ).toBeInTheDocument();
  });

  it('tells screen reader users which phone "Eliminar" removes, in Spanish as in Figma', () => {
    renderLine();

    const remove = screen.getByRole('button', {
      name: 'Eliminar Galaxy S24 Ultra, 512 GB | Titanium Violet',
    });
    expect(remove.querySelector('[lang="es"]')).toHaveTextContent('Eliminar');
  });

  it('removes the line when the user presses "Eliminar"', async () => {
    const onRemove = renderLine();

    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }));

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
