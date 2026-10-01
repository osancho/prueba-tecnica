import { useLayoutEffect, useRef, type RefObject } from 'react';
import { springTiming } from '@/lib/motion';
import type { ProductListItem } from '@/types/product';

/** morph: Figma smart animate (cards that stay move). dissolve: Figma cross-fade. */
export type GridTransition = 'morph' | 'dissolve';

interface CardSnapshot {
  top: number;
  left: number;
  width: number;
  copy: HTMLElement;
}

function snapshot(list: HTMLElement): Map<string, CardSnapshot> {
  const cards = list.querySelectorAll<HTMLElement>('[data-product-id]');
  return new Map(
    [...cards].map((card) => [
      card.dataset.productId!,
      {
        top: card.offsetTop,
        left: card.offsetLeft,
        width: card.offsetWidth,
        copy: card.cloneNode(true) as HTMLElement,
      },
    ]),
  );
}

// A copy of a removed card fades out where it was; it is inert, so it never blocks the page.
function fadeOutCopy(
  list: HTMLElement,
  card: CardSnapshot,
  timing: KeyframeAnimationOptions,
) {
  const { copy } = card;
  copy.removeAttribute('data-product-id');
  copy.setAttribute('aria-hidden', 'true');
  copy.inert = true;
  Object.assign(copy.style, {
    position: 'absolute',
    top: `${card.top}px`,
    left: `${card.left}px`,
    width: `${card.width}px`,
  });
  list.append(copy);
  copy
    .animate([{ opacity: 1 }, { opacity: 0 }], timing)
    .finished.finally(() => copy.remove());
}

/**
 * Animates cards with the Web Animations API on top of the live grid, so the user can keep
 * hovering, clicking and typing while the results change.
 */
export function useGridTransition(
  containerRef: RefObject<HTMLElement | null>,
  products: ProductListItem[],
  transition: GridTransition,
) {
  const previous = useRef<Map<string, CardSnapshot>>(new Map());

  useLayoutEffect(() => {
    const list = containerRef.current?.querySelector('ul');
    if (!list) return;

    const before = previous.current;
    const after = snapshot(list);
    previous.current = after;

    const timing = springTiming();
    if (!timing || before.size === 0) return;

    for (const [id, card] of after) {
      const old = before.get(id);
      const element = list.querySelector<HTMLElement>(
        `[data-product-id="${CSS.escape(id)}"]`,
      );
      if (old && transition === 'morph') {
        const dx = old.left - card.left;
        const dy = old.top - card.top;
        if (dx || dy) {
          element?.animate(
            [
              { transform: `translate(${dx}px, ${dy}px)` },
              { transform: 'none' },
            ],
            timing,
          );
        }
      } else {
        element?.animate([{ opacity: 0 }, { opacity: 1 }], timing);
      }
    }

    for (const [id, card] of before) {
      if (transition === 'dissolve' || !after.has(id)) {
        fadeOutCopy(list, card, timing);
      }
    }
  }, [containerRef, products, transition]);
}
