import { useRef, type MouseEvent, type PointerEvent } from 'react';

/** Movement under this many pixels is still a click on the card, not a drag. */
const DRAG_THRESHOLD = 4;

/**
 * Lets a mouse drag a horizontal list, as in the Figma prototype.
 * Touch and pens keep the browser's own scrolling.
 */
export function useDragScroll<T extends HTMLElement>() {
  const drag = useRef<{ startX: number; startScroll: number } | null>(null);
  const dragged = useRef(false);

  return {
    onPointerDown(event: PointerEvent<T>) {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag.current = {
        startX: event.clientX,
        startScroll: event.currentTarget.scrollLeft,
      };
      dragged.current = false;
    },
    onPointerMove(event: PointerEvent<T>) {
      if (!drag.current) return;
      const distance = event.clientX - drag.current.startX;
      if (!dragged.current && Math.abs(distance) < DRAG_THRESHOLD) return;
      if (!dragged.current) {
        dragged.current = true;
        // Captured only once it is a drag, so a plain click still reaches the card link.
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      event.currentTarget.scrollLeft = drag.current.startScroll - distance;
    },
    onPointerUp() {
      drag.current = null;
    },
    onPointerCancel() {
      drag.current = null;
    },
    onClickCapture(event: MouseEvent<T>) {
      if (!dragged.current) return;
      dragged.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
    onDragStart(event: MouseEvent<T>) {
      // Native image and link dragging would steal the gesture.
      event.preventDefault();
    },
  };
}
