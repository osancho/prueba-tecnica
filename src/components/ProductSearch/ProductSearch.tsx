'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingBar } from '@/components/LoadingBar/LoadingBar';
import { ProductGrid } from '@/components/ProductGrid/ProductGrid';
import { ResultsCount } from '@/components/ResultsCount/ResultsCount';
import { SearchBox } from '@/components/SearchBox/SearchBox';
import type { ProductListItem } from '@/types/product';
import { useProductSearch } from './useProductSearch';
import './ProductSearch.css';

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
  const { query, products, isPending, hasFailed, changeQuery, clear } =
    useProductSearch(initialSearch, initialProducts);

  return (
    <div className="product-search">
      <div className="product-search__bar">
        <SearchBox
          value={query}
          showClear={query !== '' && !isPending}
          onChange={changeQuery}
          onClear={clear}
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
      <div className="product-search__results" aria-busy={isPending}>
        <ProductGrid
          products={products}
          prioritizeFirstRow={products === initialProducts}
        />
      </div>
    </div>
  );
}
