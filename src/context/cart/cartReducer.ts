import type { CartLine } from '@/types/cart';

export type CartAction =
  | { type: 'add'; line: CartLine }
  | { type: 'remove'; lineId: string }
  | { type: 'restore'; lines: CartLine[] };

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add':
      return [...lines, action.line];
    case 'remove':
      return lines.filter((line) => line.lineId !== action.lineId);
    case 'restore':
      return action.lines;
  }
}
