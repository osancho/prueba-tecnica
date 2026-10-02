import Image from 'next/image';
import type { CartLine } from '@/core/cart/domain/cart_line';
import { formatPrice } from '@/lib/formatPrice';
import './CartItem.css';

interface CartItemProps {
  line: CartLine;
  onRemove: () => void;
}

export function CartItem({ line, onRemove }: CartItemProps) {
  const { brand, name, imageUrl, colorName, capacity, price } = line;
  // Figma sets two spaces before the bar; the CSS keeps them.
  const options = `${capacity}  | ${colorName}`;

  return (
    <li className="cart-item" data-transition-key={line.lineId}>
      <div className="cart-item__media">
        <Image
          className="cart-item__image"
          src={imageUrl}
          alt={`${brand} ${name} in ${colorName}`}
          fill
        />
      </div>
      <div className="cart-item__details">
        <div className="cart-item__info">
          <div className="cart-item__titles">
            <h2 className="cart-item__name">{name}</h2>
            <p className="cart-item__options">{options}</p>
          </div>
          <p className="cart-item__price">{formatPrice(price)}</p>
        </div>
        <button type="button" className="cart-item__remove" onClick={onRemove}>
          <span lang="es">Eliminar</span>
          {/* Every row says "Eliminar"; the hidden part tells them apart for screen readers. */}
          <span className="visually-hidden">{` ${name}, ${options}`}</span>
        </button>
      </div>
    </li>
  );
}
