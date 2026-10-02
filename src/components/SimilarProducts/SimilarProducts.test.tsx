import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { galaxy } from '@/components/ProductDetail/productFixture';
import { SimilarProducts } from './SimilarProducts';

// jsdom 26 has no PointerEvent, so fireEvent would drop pointerType
class PointerEvent extends MouseEvent {
  pointerType: string;
  pointerId = 1;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? '';
  }
}

/** Whether clicking the card would open it; jsdom cannot navigate, so the navigation itself is cancelled. */
function clickOpensCard() {
  const link = screen.getByRole('link');
  let opens = false;
  const cancelNavigation = (event: Event) => {
    opens = !event.defaultPrevented;
    event.preventDefault();
  };
  link.addEventListener('click', cancelNavigation);
  fireEvent.click(link);
  link.removeEventListener('click', cancelNavigation);
  return opens;
}

describe('SimilarProducts', () => {
  beforeEach(() => {
    vi.stubGlobal('PointerEvent', PointerEvent);
  });

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

  it('scrolls when dragged with the mouse without opening the card under it', () => {
    render(<SimilarProducts products={galaxy.similarProducts} />);
    const list = screen.getByRole('list');
    list.setPointerCapture = () => {};
    // jsdom does no layout, so scrolling is a plain property here
    Object.defineProperty(list, 'scrollLeft', { value: 0, writable: true });

    fireEvent.pointerDown(list, {
      pointerType: 'mouse',
      button: 0,
      clientX: 300,
    });
    fireEvent.pointerMove(list, { pointerType: 'mouse', clientX: 100 });
    fireEvent.pointerUp(list, { pointerType: 'mouse', clientX: 100 });

    expect(list.scrollLeft).toBe(200);
    expect(clickOpensCard()).toBe(false);
  });

  it('still opens the card on a plain click', () => {
    render(<SimilarProducts products={galaxy.similarProducts} />);
    const list = screen.getByRole('list');

    fireEvent.pointerDown(list, {
      pointerType: 'mouse',
      button: 0,
      clientX: 300,
    });
    fireEvent.pointerMove(list, { pointerType: 'mouse', clientX: 302 });
    fireEvent.pointerUp(list, { pointerType: 'mouse', clientX: 302 });

    expect(clickOpensCard()).toBe(true);
  });

  it('hides the section when there is nothing similar', () => {
    render(<SimilarProducts products={[]} />);

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});
