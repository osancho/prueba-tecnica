import type { ProductRepository } from '../domain/product-repository';
import { isProduct } from './product-guards';

/**
 * The catalog as the browser reaches it: through our Route Handler, so the API key stays on the
 * server. The route answers `null` for a phone that is gone; any failure is thrown, never read
 * as "gone".
 */
export const httpProductRepository: Pick<ProductRepository, 'findById'> = {
  async findById(id) {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`);
    if (!response.ok)
      throw new Error(`Product request failed: ${response.status}`);

    const product: unknown = await response.json();
    if (product === null) return null;
    if (!isProduct(product)) throw new Error(`Unexpected product: ${id}`);
    return product;
  },
};
