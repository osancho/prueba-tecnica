import type { ProductRepository } from '../domain/product-repository';
import { parseProduct } from './product-guards';

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

    const answer: unknown = await response.json();
    if (answer === null) return null;

    const product = parseProduct(answer);
    if (!product) throw new Error(`Unexpected product: ${id}`);
    return product;
  },
};
