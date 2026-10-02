import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import { PageLoadBar } from './page_load_bar';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

const pathname = vi.mocked(usePathname);

function fadeOut(element: Element) {
  const event = createEvent.animationEnd(element);
  Object.assign(event, { animationName: 'page-load-bar-out' });
  fireEvent(element, event);
}

describe('PageLoadBar', () => {
  it('shows the loading bar when the list page loads', () => {
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

    fadeOut(screen.getByRole('progressbar').parentElement!);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
