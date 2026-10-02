import { cache } from 'react';
import type { Product, ProductListItem } from '@/types/product';
import { apiClient } from './apiClient';
import { InvalidApiResponseError, NotFoundError } from './apiErrors';
import { productImageUrl } from './images/productImageUrls';
import { SEARCH_MAX_LENGTH } from './searchTerm';
import { isProduct, isProductListItem } from './productGuards';
import { uniqueById } from './uniqueById';

export const PRODUCT_LIST_SIZE = 20;
// The API repeats some ids, so fetch extra items to still fill the list after deduplication.
const PRODUCT_LIST_FETCH_LIMIT = 40;

function toListItem(item: ProductListItem): ProductListItem {
  return { ...item, imageUrl: productImageUrl(item.imageUrl) };
}

export async function getProducts(search?: string): Promise<ProductListItem[]> {
  // Every term would be a new cache entry on disk, so only the catalog without a search is kept.
  const items = await apiClient<unknown>(
    '/products',
    {
      search: search?.slice(0, SEARCH_MAX_LENGTH),
      limit: String(PRODUCT_LIST_FETCH_LIMIT),
    },
    { cacheable: !search },
  );
  if (!Array.isArray(items)) throw new InvalidApiResponseError('/products');

  // A malformed phone is left out rather than taking the whole catalog down.
  return uniqueById(items.filter(isProductListItem))
    .slice(0, PRODUCT_LIST_SIZE)
    .map(toListItem);
}

// The page and its metadata both ask for the product. Next merges the two calls only when the
// response is cached; when the API fails or is waking up it would be asked, and waited for,
// twice. cache() keeps it to one call per render.
export const getProduct = cache(async function getProduct(
  id: string,
): Promise<Product | null> {
  try {
    const path = `/products/${encodeURIComponent(id)}`;
    const product = await apiClient<unknown>(path);
    if (!isProduct(product)) throw new InvalidApiResponseError(path);

    return {
      ...product,
      colorOptions: product.colorOptions.map((color) => ({
        ...color,
        imageUrl: productImageUrl(color.imageUrl),
      })),
      similarProducts: uniqueById(
        product.similarProducts.filter(isProductListItem),
      ).map(toListItem),
    };
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
});
