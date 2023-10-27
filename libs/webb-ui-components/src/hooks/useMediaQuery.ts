'use client';

import { useEffect, useState } from 'react';

/**
 * Check if a media query matches the current viewport.
 * @param query the media query to match (e.g. '(max-width: 768px)')
 * @returns true if the media query matches, false otherwise
 */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener for old safari browsers
    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', handler);
    }

    if ('addListener' in mediaQuery) {
      mediaQuery.addListener(handler);
    }

    return () => {
      if ('addEventListener' in mediaQuery) {
        mediaQuery.removeEventListener('change', handler);
      }

      if ('addListener' in mediaQuery) {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
