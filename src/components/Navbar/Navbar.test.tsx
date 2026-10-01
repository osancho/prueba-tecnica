import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('takes the user home from the logo', () => {
    render(<Navbar />);

    expect(screen.getByRole('link', { name: 'MBST home' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('places the actions it receives inside the main navigation', () => {
    render(
      <Navbar>
        <a href="/cart">Cart</a>
      </Navbar>,
    );

    const navigation = screen.getByRole('navigation', { name: 'Main' });
    expect(
      within(navigation).getByRole('link', { name: 'Cart' }),
    ).toBeVisible();
  });
});
