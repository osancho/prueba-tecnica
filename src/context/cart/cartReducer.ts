import type { CartLine, NewCartLine } from '@/types/cart';

export type CartAction =
  | { type: 'add'; line: NewCartLine }
  | { type: 'remove'; key: string }
  | { type: 'restore'; lines: CartLine[] };

/** A cart line is one product in one color and one storage option. */
export function cartLineKey({
  id,
  colorName,
  capacity,
}: Pick<CartLine, 'id' | 'colorName' | 'capacity'>): string {
  return `${id}|${colorName}|${capacity}`;
}

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add': {
      const key = cartLineKey(action.line);
      const existing = lines.find((line) => cartLineKey(line) === key);

      if (!existing) return [...lines, { ...action.line, quantity: 1 }];
      return lines.map((line) =>
        line === existing ? { ...line, quantity: line.quantity + 1 } : line,
      );
    }
    case 'remove':
      return lines.filter((line) => cartLineKey(line) !== action.key);
    case 'restore':
      return action.lines;
  }
}
