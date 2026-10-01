import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/formatPrice';
import type { ProductListItem } from '@/types/product';
import './ProductCard.css';

interface ProductCardProps {
  product: ProductListItem;
  priority?: boolean;
  /** 3 when the cards sit under a section heading, as in "Similar items". */
  headingLevel?: 2 | 3;
}

export function ProductCard({
  product,
  priority = false,
  headingLevel = 2,
}: ProductCardProps) {
  const { id, brand, name, basePrice, imageUrl } = product;
  const Name = headingLevel === 3 ? 'h3' : 'h2';

  return (
    <Link href={`/product/${id}`} className="product-card">
      <span className="product-card__fill" aria-hidden="true" />
      <div className="product-card__image-wrapper">
        <Image
          className="product-card__image"
          src={imageUrl}
          alt={`${brand} ${name} smartphone`}
          fill
          priority={priority}
        />
      </div>
      <div className="product-card__info">
        <div className="product-card__titles">
          <p className="product-card__brand">{brand}</p>
          <Name className="product-card__name">{name}</Name>
        </div>
        <p className="product-card__price">{formatPrice(basePrice)}</p>
      </div>
    </Link>
  );
}
