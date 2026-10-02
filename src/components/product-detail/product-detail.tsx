'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button/button';
import { ColorSelector } from '@/components/color-selector/color-selector';
import { CrossFade } from '@/components/cross-fade/cross-fade';
import { StorageSelector } from '@/components/storage-selector/storage-selector';
import { useCart } from '@/context/cart/cart-context';
import { lowestPrice } from '@/core/product/domain/lowest-price';
import type { Product } from '@/core/product/domain/product';
import { formatPrice } from '@/lib/format-price';
import { useSelectionInUrl } from './use-selection-in-url';
import './product-detail.css';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { id, brand, name, colorOptions, storageOptions } = product;
  const { capacity, setCapacity, colorName, setColorName } = useSelectionInUrl(
    storageOptions.map((option) => option.capacity),
    colorOptions.map((option) => option.name),
  );
  const { add } = useCart();
  const router = useRouter();

  const storage = storageOptions.find((option) => option.capacity === capacity);
  const color = colorOptions.find((option) => option.name === colorName);
  const shownColor = color ?? colorOptions[0];

  function addToCart() {
    if (!storage || !color) return;
    add({
      id,
      brand,
      name,
      imageUrl: color.imageUrl,
      colorName: color.name,
      capacity: storage.capacity,
      price: storage.price,
    });
    router.push('/cart');
  }

  return (
    <div className="product-detail">
      <div className="product-detail__media">
        {shownColor && (
          <CrossFade id={shownColor.name} className="product-detail__images">
            <Image
              className="product-detail__image"
              src={shownColor.imageUrl}
              alt={`${brand} ${name} in ${shownColor.name}`}
              fill
              priority
            />
          </CrossFade>
        )}
      </div>
      <div className="product-detail__info">
        <div className="product-detail__heading">
          <h1 className="product-detail__name">{name}</h1>
          <p className="product-detail__price" aria-live="polite">
            <CrossFade id={capacity ?? ''}>
              {storage
                ? formatPrice(storage.price)
                : `From ${formatPrice(lowestPrice(product))}`}
            </CrossFade>
          </p>
        </div>
        <div className="product-detail__selectors">
          <StorageSelector
            options={storageOptions}
            value={capacity}
            onChange={setCapacity}
          />
          <ColorSelector
            options={colorOptions}
            value={colorName}
            onChange={setColorName}
          />
        </div>
        <Button
          className="product-detail__add"
          disabled={!storage || !color}
          onClick={addToCart}
        >
          <span lang="es">Añadir</span>
        </Button>
      </div>
    </div>
  );
}
