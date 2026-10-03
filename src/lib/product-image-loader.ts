import type { ImageLoaderProps } from 'next/image';

/**
 * The widths /api/images serves, so the browser can pick the smallest sharp one per slot:
 * 360 covers every slot at 1x and the desktop grid at 2x up to 1535 px wide screens, 520 the
 * mobile cards at 2x and the grid up to 1935 px, 648 the cart at 2x, 832 the tablet detail at
 * 2x and mobile slots at 3x, 1260 the 630 px desktop detail at 2x.
 */
export const PRODUCT_IMAGE_WIDTHS = [360, 520, 648, 832, 1260];

// Picture URLs already carry `?v=`, but a cart saved by an older version may not.
export default function productImageLoader({ src, width }: ImageLoaderProps) {
  return `${src}${src.includes('?') ? '&' : '?'}w=${width}`;
}
