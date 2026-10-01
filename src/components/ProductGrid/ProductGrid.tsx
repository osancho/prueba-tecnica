import type { CSSProperties } from 'react';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import type { ProductListItem } from '@/types/product';
import './ProductGrid.css';

// Widest first row in the design (desktop): these images can be the LCP.
const ABOVE_THE_FOLD_COUNT = 5;

// A stable name per product lets a view transition move each card to its new slot.
function transitionName(id: string): CSSProperties {
  return {
    '--product-transition-name': `product-${id.replace(/[^\w-]/g, '-')}`,
  } as CSSProperties;
}

interface ProductGridProps {
  products: ProductListItem[];
  /** Only for server-rendered lists: preloading images that are already in the DOM is wasted. */
  prioritizeFirstRow?: boolean;
}

export function ProductGrid({
  products,
  prioritizeFirstRow = true,
}: ProductGridProps) {
  return (
    <ul className="product-grid">
      {products.map((product, index) => (
        <li
          key={product.id}
          className="product-grid__item"
          style={transitionName(product.id)}
        >
          <ProductCard
            product={product}
            priority={prioritizeFirstRow && index < ABOVE_THE_FOLD_COUNT}
          />
        </li>
      ))}
    </ul>
  );
}
