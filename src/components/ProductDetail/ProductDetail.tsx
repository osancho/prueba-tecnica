'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/Button/Button';
import { ColorSelector } from '@/components/ColorSelector/ColorSelector';
import { CrossFade } from '@/components/CrossFade/CrossFade';
import { StorageSelector } from '@/components/StorageSelector/StorageSelector';
import { useCart } from '@/context/cart/CartContext';
import { formatPrice } from '@/lib/formatPrice';
import { lowestPrice } from '@/lib/lowestPrice';
import type { Product } from '@/types/product';
import './ProductDetail.css';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { id, brand, name, colorOptions, storageOptions } = product;
  const [capacity, setCapacity] = useState<string>();
  const [colorName, setColorName] = useState<string>();
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
