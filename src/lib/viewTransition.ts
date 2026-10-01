import { flushSync } from 'react-dom';

/** morph: Figma smart animate (shared elements move). dissolve: Figma cross-fade. */
export type TransitionStyle = 'morph' | 'dissolve';

export function updateWithViewTransition(
  update: () => void,
  style: TransitionStyle,
) {
  const prefersReducedMotion = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (!('startViewTransition' in document) || prefersReducedMotion) {
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.viewTransition = style;
  const transition = document.startViewTransition(() => flushSync(update));
  // A skipped transition (hidden tab, a newer one) rejects `ready`; the update still applies.
  transition.ready.catch(() => {});
  const cleanUp = () => delete root.dataset.viewTransition;
  transition.finished.then(cleanUp, cleanUp);
}
