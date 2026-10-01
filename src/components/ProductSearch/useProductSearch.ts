import { useEffect, useState } from 'react';
import { listDocumentTitle } from '@/lib/pageTitles';
import { updateWithViewTransition } from '@/lib/viewTransition';
import type { ProductListItem } from '@/types/product';

const SEARCH_DEBOUNCE_MS = 300;

interface SearchInput {
  query: string;
  cleared: boolean;
}

interface SearchResults {
  search: string;
  products: ProductListItem[];
}

async function fetchProducts(
  search: string,
  signal: AbortSignal,
): Promise<ProductListItem[]> {
  const params = search ? `?${new URLSearchParams({ search })}` : '';
  const response = await fetch(`/api/products${params}`, { signal });
  if (!response.ok) throw new Error(`Search failed: ${response.status}`);
  return response.json();
}

// replaceState, not pushState: Back should leave the page, not undo each keystroke.
function syncSearchToPage(search: string) {
  const url = search
    ? `?${new URLSearchParams({ search })}`
    : window.location.pathname;
  window.history.replaceState(null, '', url);
  document.title = listDocumentTitle(search);
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
  });
  const [hasFailed, setHasFailed] = useState(false);
  const search = input.query.trim();

  useEffect(() => {
    if (search === results.search) return;

    const controller = new AbortController();
    const timer = setTimeout(
      async () => {
        try {
          const products = await fetchProducts(search, controller.signal);
          updateWithViewTransition(
            () => setResults({ search, products }),
            input.cleared ? 'dissolve' : 'morph',
          );
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
  }, [search, input.cleared, results.search]);

  function changeQuery(query: string) {
    setHasFailed(false);
    setInput({ query, cleared: false });
  }

  function clear() {
    setHasFailed(false);
    setInput({ query: '', cleared: true });
  }

  return {
    query: input.query,
    products: results.products,
    isPending: search !== results.search && !hasFailed,
    hasFailed,
    changeQuery,
    clear,
  };
}
