import type { ProductListItem } from '../domain/product';
import type { ProductRepository } from '../domain/product-repository';

export const PRODUCT_LIST_SIZE = 20;

export async function getProducts(
  repository: ProductRepository,
  search?: string,
): Promise<ProductListItem[]> {
  // Only the catalog is cut to its first phones: a search shows, and so counts, every match.
  return repository.list(search ? { search } : { limit: PRODUCT_LIST_SIZE });
}
