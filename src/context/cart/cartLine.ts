import type { CartLine } from '@/types/cart';

const TEXT_FIELDS = [
  'id',
  'brand',
  'name',
  'imageUrl',
  'colorName',
  'capacity',
] as const;

/** Stored carts can be edited by hand or come from an older version: trust nothing. */
export function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const line = value as Record<string, unknown>;

  return (
    TEXT_FIELDS.every(
      (field) => typeof line[field] === 'string' && line[field] !== '',
    ) &&
    typeof line.price === 'number' &&
    Number.isFinite(line.price) &&
    line.price >= 0 &&
    Number.isInteger(line.quantity) &&
    (line.quantity as number) > 0
  );
}

// Adds whole cents so totals like 553.31 + 0.1 never turn into 553.4100000000001.
export function cartTotal(lines: CartLine[]): number {
  const cents = lines.reduce(
    (total, line) => total + Math.round(line.price * 100) * line.quantity,
    0,
  );
  return cents / 100;
}
