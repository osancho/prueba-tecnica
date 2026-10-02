import type { Product, ProductListItem } from './product';

export interface ProductQuery {
  search?: string;
  limit: number;
}

/** Where the catalog comes from. Implementations return only well-formed phones. */
export interface ProductRepository {
  /** Up to `limit` phones; the source may repeat an id. */
  list(query: ProductQuery): Promise<ProductListItem[]>;
  /** Null when no phone has that id. */
  findById(id: string): Promise<Product | null>;
}
