import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductCard } from '../product_card';

const galaxy = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  basePrice: 1329,
  imageUrl:
    'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U.webp',
};

describe('ProductCard', () => {
  it('takes the user to the phone detail page', () => {
    render(<ProductCard product={galaxy} />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/product/SMG-S24U',
    );
  });

  it('announces brand, name and price, with the price formatted as in the design', () => {
    render(<ProductCard product={galaxy} />);

    const card = screen.getByRole('link');
    expect(card).toHaveTextContent('Samsung');
    expect(
      screen.getByRole('heading', { name: 'Galaxy S24 Ultra' }),
    ).toBeInTheDocument();
    expect(card).toHaveTextContent('1329 EUR');
  });

  it('reads the phone once to screen reader users, without repeating the picture', () => {
    render(<ProductCard product={galaxy} />);

    expect(
      screen.getByRole('link', { name: 'Samsung Galaxy S24 Ultra 1329 EUR' }),
    ).toBeInTheDocument();
  });

  it('describes the picture in case it fails to load', () => {
    render(<ProductCard product={galaxy} />);

    expect(
      screen.getByRole('img', { name: 'Samsung Galaxy S24 Ultra' }),
    ).toBeInTheDocument();
  });
});
