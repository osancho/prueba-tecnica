import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { galaxy } from '@/components/ProductDetail/productFixture';
import { SimilarProducts } from './SimilarProducts';

describe('SimilarProducts', () => {
  it('links to similar phones under their own section heading', () => {
    render(<SimilarProducts products={galaxy.similarProducts} />);

    const section = screen.getByRole('region', { name: 'Similar items' });
    expect(
      within(section).getByRole('heading', { level: 3, name: 'Pixel 8a' }),
    ).toBeInTheDocument();
    expect(within(section).getByRole('link')).toHaveAttribute(
      'href',
      '/product/GPX-8A',
    );
  });

  it('hides the section when there is nothing similar', () => {
    render(<SimilarProducts products={[]} />);

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});
