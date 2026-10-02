import type { CartLine } from './cart-line';

/** Where the cart is kept between visits. */
export interface CartRepository {
  /** The saved lines, or none when nothing valid was saved. */
  load(): CartLine[];
  save(lines: CartLine[]): void;
}
