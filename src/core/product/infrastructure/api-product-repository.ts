import { SEARCH_MAX_LENGTH } from '@/lib/search-term';
import { apiClient } from '@/services/api-client';
import { InvalidApiResponseError, NotFoundError } from '@/services/api-errors';
import { productImageUrl } from '@/services/images/product-image-urls';
import type { ProductListItem } from '../domain/product';
import type { ProductRepository } from '../domain/product-repository';
import { isProduct, isProductListItem } from './product-guards';

function withNormalizedImage(phone: ProductListItem): ProductListItem {
  return { ...phone, imageUrl: productImageUrl(phone.imageUrl) };
}

interface ApiProductRepositoryOptions {
  /** Whether answers may come from, and go to, the shared one-hour cache. */
  cacheable: boolean;
}

/** The catalog as served by the MBST API, validated and with every picture normalized. */
function createApiProductRepository({
  cacheable,
}: ApiProductRepositoryOptions): ProductRepository {
  return {
    async list({ search, limit }) {
      // Every term would be a new cache entry on disk, so only the catalog without a search is kept.
      const phones = await apiClient<unknown>(
        '/products',
        { search: search?.slice(0, SEARCH_MAX_LENGTH), limit: String(limit) },
        { cacheable: cacheable && !search },
      );
      if (!Array.isArray(phones))
        throw new InvalidApiResponseError('/products');

      // A malformed phone is left out rather than taking the whole catalog down.
      return phones.filter(isProductListItem).map(withNormalizedImage);
    },

    async findById(id) {
      const path = `/products/${encodeURIComponent(id)}`;
      try {
        const product = await apiClient<unknown>(path, {}, { cacheable });
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
}

/** For pages: the catalog changes rarely, so many visitors share an answer up to an hour old. */
export const apiProductRepository = createApiProductRepository({
  cacheable: true,
});

/** For checks that must see the catalog as it is now, such as a saved cart's prices. */
export const liveApiProductRepository = createApiProductRepository({
  cacheable: false,
});
