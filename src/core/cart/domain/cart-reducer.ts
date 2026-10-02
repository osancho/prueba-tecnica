import type { CartChanges } from './cart-changes';
import type { CartLine } from './cart-line';

export type CartAction =
  | { type: 'add'; line: CartLine }
  | { type: 'remove'; lineId: string }
  | { type: 'restore'; lines: CartLine[] }
  | { type: 'apply-changes'; changes: CartChanges };

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add':
      return [...lines, action.line];
    case 'remove':
      return lines.filter((line) => line.lineId !== action.lineId);
    case 'restore':
      return action.lines;
    // Applied by line id, so a line the user removed meanwhile stays removed.
    case 'apply-changes': {
      const { unavailable, repriced } = action.changes;
      return lines
        .filter((line) => !unavailable.includes(line.lineId))
        .map((line) =>
          line.lineId in repriced
            ? { ...line, price: repriced[line.lineId] }
            : line,
        );
    }
  }
}
