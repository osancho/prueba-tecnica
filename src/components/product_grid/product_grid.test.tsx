import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductGrid } from './product_grid';

function phone(id: string, name: string) {
  return {
    id,
    brand: 'Apple',
    name,
    basePrice: 959,
    imageUrl: `https://prueba-tecnica-api-tienda-moviles.onrender.com/images/${id}.webp`,
  };
}

describe('ProductGrid', () => {
  it('lists every phone in the order received, each one linking to its detail', () => {
    render(
      <ProductGrid
        products={[
          phone('APL-IP15', 'iPhone 15'),
          phone('APL-IP15P', 'iPhone 15 Pro'),
        ]}
      />,
    );

    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByRole('link')).toHaveAttribute(
      'href',
      '/product/APL-IP15',
    );
    expect(within(items[1]).getByRole('link')).toHaveAttribute(
      'href',
      '/product/APL-IP15P',
    );
  });
});
