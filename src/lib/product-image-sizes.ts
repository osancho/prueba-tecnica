/**
 * The `sizes` of each product photo: how wide it shows at every breakpoint, so the browser
 * picks the smallest sharp file. `sizes` cannot read CSS custom properties, so these repeat
 * lengths that come from the tokens in `src/styles/variables.css`; the test next to this file
 * recomputes them from the tokens and fails when one changes without the other.
 */

/** Grid card: the card height (its width on desktop, where it is square) minus padding, gap and info lines. */
export const GRID_IMAGE_SIZES =
  '(min-width: 1280px) calc(20vw - 127px), (min-width: 768px) 290px, 257px';

/** "Similar items" card: `--similar-card-size` minus the same padding, gap and info lines. */
export const SIMILAR_IMAGE_SIZES =
  '(min-width: 1280px) 257px, (min-width: 768px) 290px, 257px';

/** Detail: the square photo covers the box, so it shows at the box height. */
export const DETAIL_IMAGE_SIZES =
  '(min-width: 1280px) 630px, (min-width: 768px) 416px, 273px';

/** Cart line: the square photo covers the box, so it shows at the box height. */
export const CART_IMAGE_SIZES = '(min-width: 768px) 324px, 198px';
