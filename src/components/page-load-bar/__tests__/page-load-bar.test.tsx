import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import { PageLoadBar } from '../page-load-bar';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

const pathname = vi.mocked(usePathname);

describe('PageLoadBar', () => {
  it('shows the loading bar while the list page loads', () => {
    pathname.mockReturnValue('/');
    render(<PageLoadBar />);

    expect(
      screen.getByRole('progressbar', { name: 'Loading' }),
    ).toBeInTheDocument();
  });

  it('leaves other pages to their own loading state', () => {
    pathname.mockReturnValue('/cart');
    render(<PageLoadBar />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('removes the bar once it has faded out', () => {
    pathname.mockReturnValue('/');
    render(<PageLoadBar />);

    fireEvent.transitionEnd(screen.getByRole('progressbar').parentElement!);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows no bar when the list is already on screen', () => {
    pathname.mockReturnValue('/');
    render(
      <>
        <PageLoadBar />
        <main />
      </>,
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('does not bring the bar back when the user returns to the list', () => {
    pathname.mockReturnValue('/');
    const { rerender } = render(<PageLoadBar />);

    pathname.mockReturnValue('/product/SMG-S24U');
    rerender(<PageLoadBar />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    pathname.mockReturnValue('/');
    rerender(<PageLoadBar />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
