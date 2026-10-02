import { ProductCard } from '@/components/product_card/product_card';
import type { ProductListItem } from '@/core/product/domain/product';
import './product_grid.css';

// Widest first row in the design (desktop): these images can be the LCP.
const ABOVE_THE_FOLD_COUNT = 5;

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
          data-transition-key={product.id}
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
