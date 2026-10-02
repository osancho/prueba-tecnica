import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CrossFade } from '../cross-fade';

/** Animations that end as soon as the test lets promises settle. */
function stubAnimations() {
  const animate = vi.fn(() => ({
    finished: Promise.resolve(),
    cancel: vi.fn(),
  }));
  Object.defineProperty(Element.prototype, 'animate', {
    value: animate,
    configurable: true,
  });
  return animate;
}

describe('CrossFade', () => {
  it('fades the old text out over the new one, hidden from screen readers and focus', async () => {
    const animate = stubAnimations();
    const { container, rerender } = render(
      <CrossFade id="1">Cart (1)</CrossFade>,
    );

    rerender(<CrossFade id="2">Cart (2)</CrossFade>);

    const leaving = container.querySelector('[aria-hidden="true"]');
    expect(leaving).toHaveTextContent('Cart (1)');
    expect(leaving).toHaveAttribute('inert');
    expect(screen.getByText('Cart (2)')).toBeVisible();
    expect(animate).toHaveBeenCalledWith(
      [{ opacity: 1 }, { opacity: 0 }],
      expect.anything(),
    );

    await waitFor(() =>
      expect(screen.queryByText('Cart (1)')).not.toBeInTheDocument(),
    );
  });

  it('swaps at once when the user prefers reduced motion', () => {
    stubAnimations();
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { rerender } = render(<CrossFade id="1">1229 EUR</CrossFade>);

    rerender(<CrossFade id="2">1329 EUR</CrossFade>);

    expect(screen.queryByText('1229 EUR')).not.toBeInTheDocument();
    expect(screen.getByText('1329 EUR')).toBeVisible();
  });
});
