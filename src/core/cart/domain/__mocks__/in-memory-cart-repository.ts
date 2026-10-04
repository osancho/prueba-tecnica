import type { CartLine } from '../cart-line';
import type { CartRepository } from '../cart-repository';

interface InMemoryCartRepository extends CartRepository {
  /** Replaces the saved cart as another tab does, and tells this page. */
  changeFromOutside(lines: CartLine[]): void;
}

export function inMemoryCartRepository(
  saved: CartLine[] = [],
): InMemoryCartRepository {
  let notify: (lines: CartLine[]) => void = () => {};

  return {
    load: () => saved,
    update(change) {
      saved = change(saved);
      return saved;
    },
    subscribe(onChange) {
      notify = onChange;
      return () => {
        notify = () => {};
      };
    },
    changeFromOutside(lines) {
      saved = lines;
      notify(lines);
    },
  };
}
