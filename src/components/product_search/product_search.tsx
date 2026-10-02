'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LoadingBar } from '@/components/loading_bar/loading_bar';
import { ProductGrid } from '@/components/product_grid/product_grid';
import { ResultsCount } from '@/components/results_count/results_count';
import { SearchBox } from '@/components/search_box/search_box';
import type { ProductListItem } from '@/core/product/domain/product';
import { useListTransition } from '@/lib/use_list_transition';
import { useProductSearch } from './use_product_search';
import './product_search.css';

// The server only renders page loads; in the browser, a page load of the list still has the
// layout's PageLoadBar on screen while it hydrates. Client navigations find no bar.
function isPageLoadOfList(): boolean {
  return (
    typeof document === 'undefined' ||
    document.querySelector('.page-load-bar') !== null
  );
}

interface ProductSearchProps {
  initialSearch: string;
  initialProducts: ProductListItem[];
}

export function ProductSearch(props: ProductSearchProps) {
  const router = useRouter();
  const urlSearch = useSearchParams().get('search')?.trim() ?? '';
  // Back/forward restores the page as first rendered, not the search kept in the URL since.
  const [isStale] = useState(urlSearch !== props.initialSearch);

  useEffect(() => {
    if (isStale) router.refresh();
  }, [isStale, router]);

  return isStale ? <LoadingBar /> : <ProductSearchView {...props} />;
}

function ProductSearchView({
  initialSearch,
  initialProducts,
}: ProductSearchProps) {
  const {
    query,
    products,
    transition,
    isPending,
    hasFailed,
    changeQuery,
    clear,
    retry,
  } = useProductSearch(initialSearch, initialProducts);
  const resultsRef = useRef<HTMLDivElement>(null);
  useListTransition(resultsRef, products, transition);
  // On a page load the list waits for the layout's loading bar; client navigations show it at once.
  const [isFirstLoad] = useState(isPageLoadOfList);

  return (
    <div
      className={
        isFirstLoad
          ? 'product-search product-search--first-load'
          : 'product-search'
      }
    >
      <div className="product-search__bar">
        <SearchBox
          value={query}
          showClear={query !== '' && !isPending}
          onChange={changeQuery}
          onClear={clear}
          onSubmit={retry}
        />
        <div className="product-search__status">
          {hasFailed ? (
            <p className="product-search__error" role="alert">
              Search is unavailable right now. Please try again.
            </p>
          ) : (
            <ResultsCount count={products.length} hidden={isPending} />
          )}
        </div>
      </div>
      <div
        ref={resultsRef}
        className="product-search__results"
        aria-busy={isPending}
      >
        <ProductGrid
          products={products}
          prioritizeFirstRow={products === initialProducts}
        />
      </div>
    </div>
  );
}
