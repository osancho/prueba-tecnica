import { ProductCard } from '@/components/ProductCard/ProductCard';
import type { ProductListItem } from '@/types/product';
import './ProductGrid.css';

// Widest first row in the design (desktop): these images can be the LCP.
const ABOVE_THE_FOLD_COUNT = 5;

interface ProductGridProps {
  products: ProductListItem[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <ul className="product-grid">
      {products.map((product, index) => (
        <li key={product.id} className="product-grid__item">
          <ProductCard
            product={product}
            priority={index < ABOVE_THE_FOLD_COUNT}
          />
        </li>
      ))}
    </ul>
  );
}
