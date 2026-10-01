/** Names of the duration and easing tokens of one Figma spring. */
export interface SpringTokens {
  duration: string;
  easing: string;
}

/** Figma spring mass 1, stiffness 80, damping 20. */
export const FIGMA_SPRING: SpringTokens = {
  duration: '--duration-spring',
  easing: '--easing-spring',
};

/** Figma spring mass 1, stiffness 100, damping 15. */
export const FIGMA_SPRING_BOUNCY: SpringTokens = {
  duration: '--duration-spring-reveal',
  easing: '--easing-spring-overshoot',
};

/**
 * Timing of a Figma spring for the Web Animations API, read from the design tokens.
 * Null when the user prefers reduced motion or the API is missing.
 */
export function springTiming(
  spring: SpringTokens = FIGMA_SPRING,
): KeyframeAnimationOptions | null {
  if (typeof window === 'undefined' || !('animate' in Element.prototype)) {
    return null;
  }
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  const tokens = getComputedStyle(document.documentElement);
  return {
    duration: Number.parseFloat(tokens.getPropertyValue(spring.duration)),
    easing: tokens.getPropertyValue(spring.easing).trim(),
  };
}
