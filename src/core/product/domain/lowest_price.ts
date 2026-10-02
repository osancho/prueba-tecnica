import type { Product } from './product';

/** The "From" price: the cheapest storage option, which can be below `basePrice`. */
export function lowestPrice({ storageOptions, basePrice }: Product): number {
  return storageOptions.length > 0
    ? Math.min(...storageOptions.map((option) => option.price))
    : basePrice;
}
