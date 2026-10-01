import { ProductCard } from '@/components/ProductCard/ProductCard';
import type { ProductListItem } from '@/types/product';
import './ProductGrid.css';

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
