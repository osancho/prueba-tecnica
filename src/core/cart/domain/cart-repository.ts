import type { CartLine } from './cart-line';

/** Where the cart is kept between visits, shared by every open tab. */
export interface CartRepository {
  /** The saved lines, or none when nothing valid was saved. */
  load(): CartLine[];
  /**
   * Applies a change to the lines as saved right now, not to a copy that another tab may have
   * changed since, and returns what was saved. Null when the cart cannot be saved.
   */
  update(change: (saved: CartLine[]) => CartLine[]): CartLine[] | null;
  /** Calls back with the saved lines whenever something outside this page changes them. */
  subscribe(onChange: (lines: CartLine[]) => void): () => void;
}
