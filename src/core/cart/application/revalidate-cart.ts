import type { ProductRepository } from '@/core/product/domain/product-repository';
import type { CartChanges } from '../domain/cart-changes';
import type { CartLine } from '../domain/cart-line';

/**
 * Checks a saved cart against the catalog: lines that can no longer be bought as chosen are
 * flagged, and lines whose storage changed price get the current one. A phone that cannot be
 * checked (network error, API down) is left as it is: a failed request never empties a cart.
 */
export async function revalidateCart(
  lines: CartLine[],
  repository: Pick<ProductRepository, 'findById'>,
): Promise<CartChanges> {
  const ids = [...new Set(lines.map((line) => line.id))];
  const lookups = await Promise.allSettled(
    ids.map((id) => repository.findById(id)),
  );
  const products = new Map(ids.map((id, index) => [id, lookups[index]]));

  const changes: CartChanges = { unavailable: [], repriced: {} };
  for (const line of lines) {
    const lookup = products.get(line.id);
    if (lookup?.status !== 'fulfilled') continue;

    const product = lookup.value;
    const storage = product?.storageOptions.find(
      (option) => option.capacity === line.capacity,
    );
    const hasColor = product?.colorOptions.some(
      (color) => color.name === line.colorName,
    );

    if (!storage || !hasColor) changes.unavailable.push(line.lineId);
    else if (storage.price !== line.price)
      changes.repriced[line.lineId] = storage.price;
  }
  return changes;
}
