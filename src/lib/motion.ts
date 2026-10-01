/**
 * Timing of the Figma spring (mass 1, stiffness 80, damping 20) for the Web Animations API,
 * read from the design tokens. Null when the user prefers reduced motion or the API is missing.
 */
export function springTiming(): KeyframeAnimationOptions | null {
  if (typeof window === 'undefined' || !('animate' in Element.prototype)) {
    return null;
  }
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  const tokens = getComputedStyle(document.documentElement);
  return {
    duration: parseFloat(tokens.getPropertyValue('--duration-spring')),
    easing: tokens.getPropertyValue('--easing-spring').trim(),
  };
}
