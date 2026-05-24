import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Reset the window scroll position to (0, 0) on every pathname change.
 *
 * The default `react-router-dom` `<BrowserRouter>` is path-aware but
 * scroll-naive: navigating from a long /blueprints listing to /rewards
 * lands the next page already scrolled wherever the previous page was,
 * which makes transitions feel broken (the user has to scroll up to
 * read the heading of the new page).
 *
 * Drop this component anywhere inside the router tree — it renders
 * `null` and only runs an effect.
 *
 * NOTE: pathname-only dependency is deliberate. We do NOT scroll on
 * search-param or hash changes, because some pages use those for in-page
 * tab state and an unsolicited scroll would yank the viewport away.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use 'instant' (not 'smooth') so the new page is at the top before
    // the first paint — smooth-scroll across route transitions looks
    // janky because the previous page's content briefly remains visible.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
