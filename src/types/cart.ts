export interface CartLine {
  id: string;
  brand: string;
  name: string;
  imageUrl: string;
  colorName: string;
  capacity: string;
  price: number;
  quantity: number;
}

export type NewCartLine = Omit<CartLine, 'quantity'>;
