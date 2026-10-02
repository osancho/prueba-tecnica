import { uniqueById } from '@/lib/unique-by-id';
import type { ProductListItem } from '../domain/product';
import type { ProductRepository } from '../domain/product-repository';

export const PRODUCT_LIST_SIZE = 20;
// The API repeats some ids, so ask for extra phones to still fill the list after deduplication.
const PRODUCT_LIST_FETCH_LIMIT = 40;

export async function getProducts(
  repository: ProductRepository,
  search?: string,
): Promise<ProductListItem[]> {
  const phones = await repository.list({
    search,
    limit: PRODUCT_LIST_FETCH_LIMIT,
  });
  return uniqueById(phones).slice(0, PRODUCT_LIST_SIZE);
}
