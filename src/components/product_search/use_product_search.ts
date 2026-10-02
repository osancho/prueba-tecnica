import { useEffect, useState } from 'react';
import type { ProductListItem } from '@/core/product/domain/product';
import { rememberListUrl } from '@/lib/list_url';
import { listDocumentTitle } from '@/lib/page_titles';
import type { ListTransition } from '@/lib/use_list_transition';

const SEARCH_DEBOUNCE_MS = 300;

interface SearchInput {
  query: string;
  cleared: boolean;
}

interface SearchResults {
  search: string;
  products: ProductListItem[];
  transition: ListTransition;
}

class SearchRequestError extends Error {
  constructor(readonly status: number) {
    super(`Search failed: ${status}`);
  }
}

async function fetchProducts(
  search: string,
  signal: AbortSignal,
): Promise<ProductListItem[]> {
  const params = search ? `?${new URLSearchParams({ search })}` : '';
  const response = await fetch(`/api/products${params}`, { signal });
  if (!response.ok) throw new SearchRequestError(response.status);
  return response.json();
}

// A dropped connection or a 5xx (the API waking up) often works a moment later; a 4xx will not.
function isTransient(error: unknown): boolean {
  return !(error instanceof SearchRequestError) || error.status >= 500;
}

async function fetchProductsRetryingOnce(
  search: string,
  signal: AbortSignal,
): Promise<ProductListItem[]> {
  try {
    return await fetchProducts(search, signal);
  } catch (error) {
    if (signal.aborted || !isTransient(error)) throw error;
    return fetchProducts(search, signal);
  }
}

// replaceState, not pushState: Back should leave the page, not undo each keystroke.
function syncSearchToPage(search: string) {
  const url = search
    ? `?${new URLSearchParams({ search })}`
    : window.location.pathname;
  window.history.replaceState(null, '', url);
  document.title = listDocumentTitle(search);
  rememberListUrl();
}

export function useProductSearch(
  initialSearch: string,
  initialProducts: ProductListItem[],
) {
  const [input, setInput] = useState<SearchInput>({
    query: initialSearch,
    cleared: false,
  });
  const [results, setResults] = useState<SearchResults>({
    search: initialSearch,
    products: initialProducts,
    transition: 'morph',
  });
  const [hasFailed, setHasFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const search = input.query.trim();

  useEffect(() => rememberListUrl(), []);

  useEffect(() => {
    if (search === results.search) return;

    const controller = new AbortController();
    const timer = setTimeout(
      async () => {
        try {
          const products = await fetchProductsRetryingOnce(
            search,
            controller.signal,
          );
          setResults({
            search,
            products,
            transition: input.cleared ? 'dissolve' : 'morph',
          });
          syncSearchToPage(search);
        } catch {
          if (!controller.signal.aborted) setHasFailed(true);
        }
      },
      input.cleared ? 0 : SEARCH_DEBOUNCE_MS,
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, input.cleared, results.search, attempt]);

  function changeQuery(query: string) {
    setHasFailed(false);
    setInput({ query, cleared: false });
  }

  function clear() {
    setHasFailed(false);
    setInput({ query: '', cleared: true });
  }

  // Figma has no retry button: submitting the same search again is the way to retry it.
  function retry() {
    if (!hasFailed) return;
    setHasFailed(false);
    setAttempt((count) => count + 1);
  }

  return {
    query: input.query,
    products: results.products,
    transition: results.transition,
    isPending: search !== results.search && !hasFailed,
    hasFailed,
    changeQuery,
    clear,
    retry,
  };
}
