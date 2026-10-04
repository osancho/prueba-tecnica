import type { Product, ProductListItem } from './product';

export interface ProductQuery {
  search?: string;
  /** Left out, every phone that matches. */
  limit?: number;
}

/** Where the catalog comes from. Implementations return only well-formed phones, each id once. */
export interface ProductRepository {
  /** The first `limit` phones in catalog order. */
  list(query: ProductQuery): Promise<ProductListItem[]>;
  /** Null when no phone has that id. */
  findById(id: string): Promise<Product | null>;
}
