'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingBar } from '@/components/loading-bar/loading-bar';
import './page-load-bar.css';

// React streams the page inside a hidden element before revealing it.
const REVEALED_PAGE = 'main:not([hidden] *)';

/**
 * Figma "Loading" on a page load of the list. It lives in the layout, outside the streamed page,
 * so it is a single element from the first paint: it fills while the server prepares the list
 * and dissolves the moment the page comes in (see `.page-load-bar` in the CSS). A page that
 * comes with the first paint shows no bar at all.
 */
export function PageLoadBar() {
  const isOnList = usePathname() === '/';
  const [isShown, setIsShown] = useState(isOnList);

  // The page may have come in before the script did, leaving no transition to end; and once
  // the user leaves the list the bar is over for good.
  useEffect(() => {
    if (!isOnList || document.querySelector(REVEALED_PAGE)) setIsShown(false);
  }, [isOnList]);

  if (!isShown || !isOnList) return null;
  return (
    <div className="page-load-bar" onTransitionEnd={() => setIsShown(false)}>
      <LoadingBar />
    </div>
  );
}
