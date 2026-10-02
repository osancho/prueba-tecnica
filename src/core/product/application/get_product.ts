import { uniqueById } from '@/lib/unique_by_id';
import type { Product } from '../domain/product';
import type { ProductRepository } from '../domain/product_repository';

export async function getProduct(
  repository: ProductRepository,
  id: string,
): Promise<Product | null> {
  const product = await repository.findById(id);
  return (
    product && {
      ...product,
      similarProducts: uniqueById(product.similarProducts),
    }
  );
}
