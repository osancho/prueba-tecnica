import { uniqueById } from '@/lib/unique-by-id';
import type { ProductListItem } from '../domain/product';
import type { ProductRepository } from '../domain/product-repository';

export const PRODUCT_LIST_SIZE = 20;
// The API repeats some ids, so ask for extra phones to still fill the list after deduplication.
// A search is read from the same single request, so this is also the most matches it can show.
const PRODUCT_LIST_FETCH_LIMIT = 40;

export async function getProducts(
  repository: ProductRepository,
  search?: string,
): Promise<ProductListItem[]> {
  const phones = uniqueById(
    await repository.list({ search, limit: PRODUCT_LIST_FETCH_LIMIT }),
  );
  // Only the catalog is cut to its first phones: a search shows, and so counts, every match.
  return search ? phones : phones.slice(0, PRODUCT_LIST_SIZE);
}
