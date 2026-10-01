import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/formatPrice';
import type { ProductListItem } from '@/types/product';
import './ProductCard.css';

interface ProductCardProps {
  product: ProductListItem;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { id, brand, name, basePrice, imageUrl } = product;

  return (
    <Link href={`/product/${id}`} className="product-card">
      <span className="product-card__fill" aria-hidden="true" />
      <div className="product-card__image-wrapper">
        <Image
          className="product-card__image"
          src={imageUrl}
          alt={`${brand} ${name} smartphone`}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 50vw, 100vw"
          priority={priority}
        />
      </div>
      <div className="product-card__info">
        <div className="product-card__titles">
          <p className="product-card__brand">{brand}</p>
          <h2 className="product-card__name">{name}</h2>
        </div>
        <p className="product-card__price">{formatPrice(basePrice)}</p>
      </div>
    </Link>
  );
}
