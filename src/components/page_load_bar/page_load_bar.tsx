'use client';

import { usePathname } from 'next/navigation';
import { useState, type AnimationEvent } from 'react';
import { LoadingBar } from '@/components/loading_bar/loading_bar';
import './page_load_bar.css';

/**
 * Figma "Loading" on a page load of the list. It lives in the layout, outside the streamed page,
 * so it is a single element from the first paint: it fills while the server prepares the list
 * and fades out as the list comes in (see `.page-load-bar` in the CSS).
 */
export function PageLoadBar() {
  const [isShown, setIsShown] = useState(usePathname() === '/');

  function removeOnceFaded(event: AnimationEvent) {
    if (event.animationName === 'page-load-bar-out') setIsShown(false);
  }

  if (!isShown) return null;
  return (
    <div className="page-load-bar" onAnimationEnd={removeOnceFaded}>
      <LoadingBar />
    </div>
  );
}
