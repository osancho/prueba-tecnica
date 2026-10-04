'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LoadingBar } from '@/components/loading-bar/loading-bar';
import { ProductGrid } from '@/components/product-grid/product-grid';
import { ResultsCount } from '@/components/results-count/results-count';
import { SearchBox } from '@/components/search-box/search-box';
import type { ProductListItem } from '@/core/product/domain/product';
import { useListTransition } from '@/lib/use-list-transition';
import { useProductSearch } from './use-product-search';
import './product-search.css';

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

  return (
    <div className="product-search">
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
