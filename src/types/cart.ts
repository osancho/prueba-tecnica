/** One row per "Añadir": adding the same phone twice shows it twice, as in Figma. */
export interface CartLine {
  lineId: string;
  id: string;
  brand: string;
  name: string;
  imageUrl: string;
  colorName: string;
  capacity: string;
  price: number;
}

export type NewCartLine = Omit<CartLine, 'lineId'>;
