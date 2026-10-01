import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const STORAGE_PARAM = 'storage';
const COLOR_PARAM = 'color';

function knownValue(value: string | null, options: string[]) {
  return value && options.includes(value) ? value : undefined;
}

/**
 * Storage and color live in the URL, so a shared link opens the phone as the user configured it.
 * Read from the URL, not from server props: Back restores the page as it was first rendered.
 */
export function useSelectionInUrl(capacities: string[], colorNames: string[]) {
  const searchParams = useSearchParams();
  const [capacity, setCapacity] = useState(() =>
    knownValue(searchParams.get(STORAGE_PARAM), capacities),
  );
  const [colorName, setColorName] = useState(() =>
    knownValue(searchParams.get(COLOR_PARAM), colorNames),
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const [param, value] of [
      [STORAGE_PARAM, capacity],
      [COLOR_PARAM, colorName],
    ] as const) {
      if (value) params.set(param, value);
      else params.delete(param);
    }

    const query = params.toString();
    const search = query ? `?${query}` : '';
    // replaceState, not pushState: Back should leave the page, not undo each choice.
    if (search !== window.location.search) {
      window.history.replaceState(null, '', search || window.location.pathname);
    }
  }, [capacity, colorName]);

  return { capacity, setCapacity, colorName, setColorName };
}
