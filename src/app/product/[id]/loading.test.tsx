import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Loading from './loading';

describe('Product Loading', () => {
  it('shows the loading bar while the product is on its way', () => {
    render(<Loading />);

    expect(
      screen.getByRole('progressbar', { name: 'Loading' }),
    ).toBeInTheDocument();
  });
});
