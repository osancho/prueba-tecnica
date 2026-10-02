'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Button } from '@/components/button/button';
import { CartItem } from '@/components/cart-item/cart-item';
import { CrossFade } from '@/components/cross-fade/cross-fade';
import { useCart } from '@/context/cart/cart-context';
import type { CartChanges } from '@/core/cart/domain/cart-changes';
import { formatPrice } from '@/lib/format-price';
import { FIGMA_SPRING_BOUNCY } from '@/lib/motion';
import { useListTransition } from '@/lib/use-list-transition';
import { useCartRevalidation } from './use-cart-revalidation';
import './cart.css';

/** What the catalog check changed, in the words the user reads; empty when nothing changed. */
function describeChanges(changes: CartChanges | null): string {
  if (!changes) return '';
  const removed = changes.unavailable.length;
  const repriced = Object.keys(changes.repriced).length;

  return [
    removed === 1 &&
      'A phone in your cart is no longer available and was removed.',
    removed > 1 &&
      `${removed} phones in your cart are no longer available and were removed.`,
    repriced === 1 && 'A phone in your cart has a new price.',
    repriced > 1 && `${repriced} phones in your cart have new prices.`,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Cart() {
  const { lines, isRestored, count, total, remove } = useCart();
  const cartRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useListTransition(cartRef, lines, 'morph', FIGMA_SPRING_BOUNCY);
  const changes = useCartRevalidation();

  // The cart lives in the browser: render nothing rather than flash an empty cart.
  if (!isRestored) return null;

  // The removed button disappears; focus goes to the title, which reads the new count.
  function removeLine(lineId: string) {
    remove(lineId);
    titleRef.current?.focus();
  }

  const isEmpty = count === 0;

  return (
    <div ref={cartRef} className={isEmpty ? 'cart' : 'cart cart--filled'}>
      <div className="cart__content">
        <h1 ref={titleRef} className="cart__title" tabIndex={-1}>
          <CrossFade id={String(count)} spring={FIGMA_SPRING_BOUNCY}>
            Cart ({count})
          </CrossFade>
        </h1>
        {/* Always rendered, so screen readers announce the text when it arrives. */}
        <p className="cart__notice" role="status">
          {describeChanges(changes)}
        </p>
        <ul className="cart__lines">
          {lines.map((line) => (
            <CartItem
              key={line.lineId}
              line={line}
              onRemove={() => removeLine(line.lineId)}
            />
          ))}
        </ul>
      </div>
      <footer
        className={
          isEmpty ? 'cart__footer cart__footer--empty' : 'cart__footer'
        }
      >
        {!isEmpty && (
          <p className="cart__total" data-transition-key="total">
            <span>Total</span>
            <CrossFade id={String(total)} spring={FIGMA_SPRING_BOUNCY}>
              {formatPrice(total)}
            </CrossFade>
          </p>
        )}
        <Link href="/" className="button button--secondary cart__continue">
          Continue shopping
        </Link>
        {!isEmpty && (
          <Button className="cart__pay" data-transition-key="pay">
            Pay
          </Button>
        )}
      </footer>
    </div>
  );
}
