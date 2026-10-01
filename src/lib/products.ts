import type { Product, ProductListItem } from '@/types/product';
import { apiClient } from './apiClient';
import { NotFoundError } from './apiErrors';
import { productImageUrl } from './images/productImageUrls';
import { uniqueById } from './uniqueById';

export const PRODUCT_LIST_SIZE = 20;
// The API repeats some ids, so fetch extra items to still fill the list after deduplication.
const PRODUCT_LIST_FETCH_LIMIT = 40;

function toListItem(item: ProductListItem): ProductListItem {
  return { ...item, imageUrl: productImageUrl(item.imageUrl) };
}

export async function getProducts(search?: string): Promise<ProductListItem[]> {
  const items = await apiClient<ProductListItem[]>('/products', {
    search,
    limit: String(PRODUCT_LIST_FETCH_LIMIT),
  });

  return uniqueById(items).slice(0, PRODUCT_LIST_SIZE).map(toListItem);
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const product = await apiClient<Product>(
      `/products/${encodeURIComponent(id)}`,
    );

    return {
      ...product,
      colorOptions: product.colorOptions.map((color) => ({
        ...color,
        imageUrl: productImageUrl(color.imageUrl),
      })),
      similarProducts: uniqueById(product.similarProducts).map(toListItem),
    };
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}
