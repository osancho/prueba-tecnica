import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CartLink } from './cart_link';

describe('CartLink', () => {
  it('takes the user to the cart', () => {
    render(<CartLink count={0} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/cart');
  });

  it.each([
    [0, '0 products in the cart'],
    [1, '1 product in the cart'],
    [3, '3 products in the cart'],
  ])(
    'tells screen reader users how many products the cart holds (%i)',
    (count, label) => {
      render(<CartLink count={count} />);

      expect(screen.getByRole('link', { name: label })).toHaveTextContent(
        String(count),
      );
    },
  );
});
