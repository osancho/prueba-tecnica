// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CART_IMAGE_SIZES,
  DETAIL_IMAGE_SIZES,
  GRID_IMAGE_SIZES,
  SIMILAR_IMAGE_SIZES,
} from '../product-image-sizes';

const ROOT_FONT_SIZE = 16;
const css = readFileSync(
  new URL('../../styles/variables.css', import.meta.url),
  'utf8',
);

/** The custom properties set in the base `:root` and, cumulatively, at each breakpoint. */
function tokensByBreakpoint() {
  const blocks = [
    ...css.matchAll(
      /(?:@media \(min-width: (\d+)px\) \{\s*)?:root \{([^}]*)\}/g,
    ),
  ];
  const tokens: Record<string, string> = {};
  return blocks.map(([, minWidth, body]) => {
    for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
      tokens[name] = value.trim();
    }
    return { minWidth: Number(minWidth ?? 0), tokens: { ...tokens } };
  });
}

/** A length token in px: resolves `var()`, `px` and `rem`. */
function px(tokens: Record<string, string>, name: string): number {
  const value = tokens[name];
  const reference = value.match(/^var\((--[\w-]+)\)$/);
  if (reference) return px(tokens, reference[1]);
  if (value.endsWith('rem')) return parseFloat(value) * ROOT_FONT_SIZE;
  if (value.endsWith('px')) return parseFloat(value);
  throw new Error(`${name} is not a length: ${value}`);
}

function ratio(tokens: Record<string, string>, name: string): number {
  const [width, height] = tokens[name].split('/').map(Number);
  return height / width;
}

/** Card padding, the gap above the info and its two lines: what the photo does not get. */
function cardChrome(tokens: Record<string, string>): number {
  return (
    2 * px(tokens, '--space-sm') +
    px(tokens, '--space-md') +
    px(tokens, '--line-height-2xs') +
    px(tokens, '--space-3xs') +
    px(tokens, '--line-height-xs')
  );
}

const [mobile, tablet, desktop] = tokensByBreakpoint().map(
  ({ tokens }) => tokens,
);

function columnsOf(tokens: Record<string, string>): number {
  return Number(
    tokens['--product-grid-columns'].match(/repeat\((\d+)/)?.[1] ?? 1,
  );
}

describe('product photo sizes', () => {
  it('read the breakpoints the tokens use', () => {
    expect(tokensByBreakpoint().map(({ minWidth }) => minWidth)).toEqual([
      0, 768, 1280,
    ]);
  });

  it('match the grid cards, square on desktop and fixed height below', () => {
    const columns = columnsOf(desktop);
    const fixed =
      (2 * px(desktop, '--page-gutter')) / columns + cardChrome(desktop);
    const expected = [
      `(min-width: 1280px) calc(${100 / columns}vw - ${fixed}px)`,
      `(min-width: 768px) ${px(tablet, '--product-card-height') - cardChrome(tablet)}px`,
      `${px(mobile, '--product-card-height') - cardChrome(mobile)}px`,
    ].join(', ');

    expect(GRID_IMAGE_SIZES).toBe(expected);
  });

  it('match the "Similar items" cards', () => {
    const side = (tokens: Record<string, string>) =>
      px(tokens, '--similar-card-size') - cardChrome(tokens);

    expect(SIMILAR_IMAGE_SIZES).toBe(
      `(min-width: 1280px) ${side(desktop)}px, (min-width: 768px) ${side(tablet)}px, ${side(mobile)}px`,
    );
  });

  it('match the height of the detail photo box', () => {
    const height = (tokens: Record<string, string>) =>
      Math.ceil(
        px(tokens, '--detail-image-width') *
          ratio(tokens, '--detail-image-ratio'),
      );

    expect(DETAIL_IMAGE_SIZES).toBe(
      `(min-width: 1280px) ${height(desktop)}px, (min-width: 768px) ${height(tablet)}px, ${height(mobile)}px`,
    );
  });

  it('match the height of the cart photo box, the same on tablet and desktop', () => {
    const height = (tokens: Record<string, string>) =>
      Math.ceil(
        px(tokens, '--cart-image-width') * ratio(tokens, '--cart-image-ratio'),
      );

    expect(height(desktop)).toBe(height(tablet));
    expect(CART_IMAGE_SIZES).toBe(
      `(min-width: 768px) ${height(tablet)}px, ${height(mobile)}px`,
    );
  });
});
