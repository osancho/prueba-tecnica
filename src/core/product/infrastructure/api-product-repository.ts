import { apiClient } from '@/services/api-client';
import { InvalidApiResponseError, NotFoundError } from '@/services/api-errors';
import { productImageUrl } from '@/services/images/product-image-urls';
import { SEARCH_TIMEOUT_MS } from '@/services/server-config';
import type { ProductListItem } from '../domain/product';
import type { ProductRepository } from '../domain/product-repository';
import { SEARCH_MAX_LENGTH } from '../domain/search-term';
import { isProductListItem, parseProduct } from './product-guards';
import { uniqueById } from './unique-by-id';

// The API repeats some ids, so it is asked for more phones than any list shows, to still fill
// the list once the repeats are gone. It never returns more than its 24 entries, so the same
// request also brings every match of a search.
const API_LIST_LIMIT = 40;

function withNormalizedImage(phone: ProductListItem): ProductListItem {
  return { ...phone, imageUrl: productImageUrl(phone.imageUrl) };
}

interface ApiProductRepositoryOptions {
  /** Whether answers may come from, and go to, the shared one-hour cache. */
  cacheable: boolean;
  /** Left out, the long wait a page load allows for the API to wake up. */
  timeoutMs?: number;
}

/**
 * The catalog as served by the MBST API: validated, each phone once and with every picture
 * normalized.
 */
function createApiProductRepository({
  cacheable,
  timeoutMs,
}: ApiProductRepositoryOptions): ProductRepository {
  return {
    async list({ search, limit }) {
      // Every term would be a new cache entry on disk, so only the catalog without a search is kept.
      const phones = await apiClient<unknown>(
        '/products',
        {
          search: search?.slice(0, SEARCH_MAX_LENGTH),
          limit: String(API_LIST_LIMIT),
        },
        { cacheable: cacheable && !search, timeoutMs },
      );
      if (!Array.isArray(phones))
        throw new InvalidApiResponseError('/products');

      // A malformed phone is left out rather than taking the whole catalog down.
      return uniqueById(phones.filter(isProductListItem))
        .slice(0, limit)
        .map(withNormalizedImage);
    },

    async findById(id) {
      const path = `/products/${encodeURIComponent(id)}`;
      try {
        const product = parseProduct(
          await apiClient<unknown>(path, {}, { cacheable, timeoutMs }),
        );
        if (!product) throw new InvalidApiResponseError(path);

        return {
          ...product,
          colorOptions: product.colorOptions.map((color) => ({
            ...color,
            imageUrl: productImageUrl(color.imageUrl),
          })),
          similarProducts: uniqueById(product.similarProducts).map(
            withNormalizedImage,
          ),
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

/** For the search typed in the browser, which must fail in seconds rather than wait for a wake-up. */
export const searchApiProductRepository = createApiProductRepository({
  cacheable: true,
  timeoutMs: SEARCH_TIMEOUT_MS,
});

/** For checks that must see the catalog as it is now, such as a saved cart's prices. */
export const liveApiProductRepository = createApiProductRepository({
  cacheable: false,
});
