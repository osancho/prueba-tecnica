'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { Button } from '@/components/Button/Button';
import { CartItem } from '@/components/CartItem/CartItem';
import { CrossFade } from '@/components/CrossFade/CrossFade';
import { useCart } from '@/context/cart/CartContext';
import { formatPrice } from '@/lib/formatPrice';
import { FIGMA_SPRING_BOUNCY } from '@/lib/motion';
import { useListTransition } from '@/lib/useListTransition';
import './Cart.css';

export function Cart() {
  const { lines, isRestored, count, total, remove } = useCart();
  const cartRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useListTransition(cartRef, lines, 'morph', FIGMA_SPRING_BOUNCY);

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
