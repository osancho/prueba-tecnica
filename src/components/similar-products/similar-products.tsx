'use client';

import { useRef, type PointerEvent } from 'react';
import { ProductCard } from '@/components/product-card/product-card';
import type { ProductListItem } from '@/core/product/domain/product';
import { SIMILAR_IMAGE_SIZES } from '@/lib/product-image-sizes';
import { useDragScroll } from '@/lib/use-drag-scroll';
import './similar-products.css';

interface SimilarProductsProps {
  products: ProductListItem[];
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragScroll = useDragScroll<HTMLUListElement>();

  // A style property instead of state: scrolling should not re-render the cards.
  function moveThumb() {
    const list = listRef.current;
    if (!list) return;
    const maxScroll = list.scrollWidth - list.clientWidth;
    thumbRef.current?.style.setProperty(
      '--scroll-progress',
      String(maxScroll > 0 ? list.scrollLeft / maxScroll : 0),
    );
  }

  // The Figma bar works as a scrollbar: mice without horizontal scroll can drag it or click it.
  function scrollToPointer(event: PointerEvent<HTMLDivElement>) {
    const list = listRef.current;
    const thumb = thumbRef.current;
    if (!list || !thumb) return;
    const track = event.currentTarget.getBoundingClientRect();
    const travel = track.width - thumb.offsetWidth;
    const pointer = event.clientX - track.left - thumb.offsetWidth / 2;
    const progress =
      travel > 0 ? Math.min(Math.max(pointer / travel, 0), 1) : 0;
    list.scrollLeft = progress * (list.scrollWidth - list.clientWidth);
  }

  if (products.length === 0) return null;

  return (
    <section
      className="similar-products"
      aria-labelledby="similar-products-title"
    >
      <h2 id="similar-products-title" className="similar-products__title">
        Similar items
      </h2>
      <ul
        ref={listRef}
        className="similar-products__list"
        onScroll={moveThumb}
        {...dragScroll}
      >
        {products.map((product) => (
          <li key={product.id} className="similar-products__item">
            <ProductCard
              product={product}
              headingLevel={3}
              imageSizes={SIMILAR_IMAGE_SIZES}
            />
          </li>
        ))}
      </ul>
      <div
        className="similar-products__scrollbar"
        aria-hidden="true"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          scrollToPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            scrollToPointer(event);
          }
        }}
      >
        <div className="similar-products__track">
          <div ref={thumbRef} className="similar-products__thumb" />
        </div>
      </div>
    </section>
  );
}
