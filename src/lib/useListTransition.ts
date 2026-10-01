import { useLayoutEffect, useRef, type RefObject } from 'react';
import { FIGMA_SPRING, springTiming, type SpringTokens } from '@/lib/motion';

/** morph: Figma smart animate (items that stay move). dissolve: Figma cross-fade. */
export type ListTransition = 'morph' | 'dissolve';

interface ItemSnapshot {
  top: number;
  left: number;
  width: number;
  parent: HTMLElement;
  copy: HTMLElement;
}

function snapshot(container: HTMLElement): Map<string, ItemSnapshot> {
  const items = container.querySelectorAll<HTMLElement>(
    '[data-transition-key]',
  );
  return new Map(
    [...items].map((item) => [
      item.dataset.transitionKey!,
      {
        top: item.offsetTop,
        left: item.offsetLeft,
        width: item.offsetWidth,
        parent: item.parentElement!,
        copy: item.cloneNode(true) as HTMLElement,
      },
    ]),
  );
}

// A copy of a removed item fades out where it was; it is inert, so it never blocks the page.
function fadeOutCopy(item: ItemSnapshot, timing: KeyframeAnimationOptions) {
  const { copy } = item;
  copy.removeAttribute('data-transition-key');
  copy.setAttribute('aria-hidden', 'true');
  copy.inert = true;
  Object.assign(copy.style, {
    position: 'absolute',
    top: `${item.top}px`,
    left: `${item.left}px`,
    width: `${item.width}px`,
  });
  item.parent.append(copy);
  const removeCopy = () => copy.remove();
  copy
    .animate([{ opacity: 1 }, { opacity: 0 }], timing)
    .finished.then(removeCopy, removeCopy);
}

/**
 * Animates the `data-transition-key` elements inside the container with the Web Animations
 * API on top of the live DOM, so the user can keep hovering, clicking and typing meanwhile.
 * Each item's parent must be positioned: removed items fade out in place inside it.
 */
export function useListTransition(
  containerRef: RefObject<HTMLElement | null>,
  items: unknown,
  transition: ListTransition = 'morph',
  spring: SpringTokens = FIGMA_SPRING,
) {
  const previous = useRef<Map<string, ItemSnapshot>>(new Map());

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const before = previous.current;
    const after = snapshot(container);
    previous.current = after;

    const timing = springTiming(spring);
    if (!timing || before.size === 0) return;

    for (const [key, item] of after) {
      const old = before.get(key);
      const element = container.querySelector<HTMLElement>(
        `[data-transition-key="${CSS.escape(key)}"]`,
      );
      if (old && transition === 'morph') {
        const dx = old.left - item.left;
        const dy = old.top - item.top;
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

    for (const [key, item] of before) {
      if (transition === 'dissolve' || !after.has(key)) {
        fadeOutCopy(item, timing);
      }
    }
  }, [containerRef, items, transition, spring]);
}
