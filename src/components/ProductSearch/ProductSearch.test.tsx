import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProductListItem } from '@/types/product';
import { ProductSearch } from './ProductSearch';

const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

const iphone: ProductListItem = {
  id: 'APL-IP15P',
  brand: 'Apple',
  name: 'iPhone 15 Pro',
  basePrice: 1219,
  imageUrl: '/api/images/APL-IP15P.webp',
};

const galaxy: ProductListItem = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  basePrice: 1329,
  imageUrl: '/api/images/SMG-S24U.webp',
};

function respondWith(products: ProductListItem[]) {
  return { ok: true, json: async () => products } as Response;
}

function setup(
  initialSearch: string,
  initialProducts: ProductListItem[],
  url = initialSearch ? `/?search=${initialSearch}` : '/',
) {
  const fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal('fetch', fetchMock);
  window.history.replaceState(null, '', url);
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(
    <ProductSearch
      initialSearch={initialSearch}
      initialProducts={initialProducts}
    />,
  );
  return { fetchMock, user };
}

describe('ProductSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('shows the matching phones once the user stops typing, with a single request', async () => {
    const { fetchMock, user } = setup('', [iphone, galaxy]);
    fetchMock.mockResolvedValue(respondWith([galaxy]));

    await user.type(screen.getByRole('searchbox'), 'galaxy');
    expect(fetchMock).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(await screen.findByText('1 result')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/products?search=galaxy');
    expect(
      screen.queryByRole('link', { name: /iPhone 15 Pro/ }),
    ).not.toBeInTheDocument();
    expect(window.location.search).toBe('?search=galaxy');
    expect(document.title).toBe('Results for “galaxy” | MBST');
  });

  it('cancels the previous request when the user keeps typing', async () => {
    const { fetchMock, user } = setup('', [iphone, galaxy]);
    fetchMock.mockReturnValue(new Promise(() => {}));

    await user.type(screen.getByRole('searchbox'), 'gal');
    await act(() => vi.advanceTimersByTimeAsync(300));
    await user.type(screen.getByRole('searchbox'), 'a');

    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it('brings the full catalog back when the search is cleared', async () => {
    const { fetchMock, user } = setup('galaxy', [galaxy]);
    fetchMock.mockResolvedValue(respondWith([iphone, galaxy]));

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(await screen.findByText('2 results')).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/products');
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(window.location.search).toBe('');
    expect(document.title).toBe('Smartphones | MBST');
  });

  it('reloads the search kept in the URL when the user comes back to the list', () => {
    setup('', [iphone, galaxy], '/?search=galaxy');

    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('keeps the current phones and explains the problem when a search fails', async () => {
    const { fetchMock, user } = setup('', [iphone]);
    fetchMock.mockResolvedValue({ ok: false, status: 502 } as Response);

    await user.type(screen.getByRole('searchbox'), 'pixel');
    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Search is unavailable right now. Please try again.',
    );
    expect(
      screen.getByRole('link', { name: /iPhone 15 Pro/ }),
    ).toBeInTheDocument();
  });

  it('shows the results when the search only failed for a moment', async () => {
    const { fetchMock, user } = setup('', [iphone]);
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce(respondWith([galaxy]));

    await user.type(screen.getByRole('searchbox'), 'galaxy');
    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(await screen.findByText('1 result')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not repeat a search the server rejected', async () => {
    const { fetchMock, user } = setup('', [iphone]);
    fetchMock.mockResolvedValue({ ok: false, status: 400 } as Response);

    await user.type(screen.getByRole('searchbox'), 'galaxy');
    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('repeats a failed search when the user presses Enter', async () => {
    const { fetchMock, user } = setup('', [iphone]);
    fetchMock.mockResolvedValue({ ok: false, status: 502 } as Response);
    await user.type(screen.getByRole('searchbox'), 'galaxy');
    await act(() => vi.advanceTimersByTimeAsync(300));
    await screen.findByRole('alert');

    fetchMock.mockResolvedValue(respondWith([galaxy]));
    await user.type(screen.getByRole('searchbox'), '{Enter}');
    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(await screen.findByText('1 result')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveValue('galaxy');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
