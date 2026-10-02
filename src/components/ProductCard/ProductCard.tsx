import Image from 'next/image';
import Link from 'next/link';
import { useId } from 'react';
import type { ProductListItem } from '@/core/product/domain/product';
import { formatPrice } from '@/lib/formatPrice';
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
  const infoId = useId();

  return (
    // Named by the visible text only, so the picture's alt (shown if it fails to load) is not
    // read a second time.
    <Link
      href={`/product/${id}`}
      className="product-card"
      aria-labelledby={infoId}
    >
      <span className="product-card__fill" aria-hidden="true" />
      <div className="product-card__image-wrapper">
        <Image
          className="product-card__image"
          src={imageUrl}
          alt={`${brand} ${name}`}
          fill
          priority={priority}
        />
      </div>
      <div id={infoId} className="product-card__info">
        <div className="product-card__titles">
          <p className="product-card__brand">{brand}</p>
          <Name className="product-card__name">{name}</Name>
        </div>
        <p className="product-card__price">{formatPrice(basePrice)}</p>
      </div>
    </Link>
  );
}
