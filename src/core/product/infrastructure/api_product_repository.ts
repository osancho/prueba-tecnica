import { SEARCH_MAX_LENGTH } from '@/lib/search_term';
import { apiClient } from '@/services/api_client';
import { InvalidApiResponseError, NotFoundError } from '@/services/api_errors';
import { productImageUrl } from '@/services/images/product_image_urls';
import type { ProductListItem } from '../domain/product';
import type { ProductRepository } from '../domain/product_repository';
import { isProduct, isProductListItem } from './product_guards';

function withNormalizedImage(phone: ProductListItem): ProductListItem {
  return { ...phone, imageUrl: productImageUrl(phone.imageUrl) };
}

/** The catalog as served by the MBST API, validated and with every picture normalized. */
export const apiProductRepository: ProductRepository = {
  async list({ search, limit }) {
    // Every term would be a new cache entry on disk, so only the catalog without a search is kept.
    const phones = await apiClient<unknown>(
      '/products',
      { search: search?.slice(0, SEARCH_MAX_LENGTH), limit: String(limit) },
      { cacheable: !search },
    );
    if (!Array.isArray(phones)) throw new InvalidApiResponseError('/products');

    // A malformed phone is left out rather than taking the whole catalog down.
    return phones.filter(isProductListItem).map(withNormalizedImage);
  },

  async findById(id) {
    const path = `/products/${encodeURIComponent(id)}`;
    try {
      const product = await apiClient<unknown>(path);
      if (!isProduct(product)) throw new InvalidApiResponseError(path);

      return {
        ...product,
        colorOptions: product.colorOptions.map((color) => ({
          ...color,
          imageUrl: productImageUrl(color.imageUrl),
        })),
        similarProducts: product.similarProducts
          .filter(isProductListItem)
          .map(withNormalizedImage),
      };
    } catch (error) {
      if (error instanceof NotFoundError) return null;
      throw error;
    }
  },
};
