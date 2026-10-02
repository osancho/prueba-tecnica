import type { Product } from '@/core/product/domain/product';
import './product-specs.css';

interface ProductSpecsProps {
  product: Product;
}

function specRows({ brand, name, description, specs }: Product) {
  return [
    ['Brand', brand],
    ['Name', name],
    ['Description', description],
    ['Screen', specs.screen],
    ['Resolution', specs.resolution],
    ['Processor', specs.processor],
    ['Main camera', specs.mainCamera],
    ['Selfie camera', specs.selfieCamera],
    ['Battery', specs.battery],
    ['OS', specs.os],
    ['Screen refresh rate', specs.screenRefreshRate],
  ];
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  return (
    <section className="product-specs" aria-labelledby="product-specs-title">
      <h2 id="product-specs-title" className="product-specs__title">
        Specifications
      </h2>
      <dl className="product-specs__list">
        {specRows(product).map(([label, value]) => (
          <div key={label} className="product-specs__row">
            <dt className="product-specs__label">{label}</dt>
            {/* The products API writes descriptions and specs in Spanish. */}
            <dd className="product-specs__value" lang="es">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
