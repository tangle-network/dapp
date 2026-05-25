import { type FC, type ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Page-to-page transition. 100ms opacity + 4px y translate on route change.
 *
 * Deliberately tiny: the goal is "the page acknowledged my click" not "watch
 * a fancy slide." Anything longer than ~150ms reads as the app being slow,
 * not polished. Anything more than a few pixels of translate reads as motion
 * sickness.
 *
 * Implementation: when `useLocation().pathname` changes, briefly mark the
 * shell as `data-motion="entering"` so a CSS keyframe animates the fade-in.
 * One frame later (via setTimeout 0 — actually 16ms for the rAF) we clear
 * the attribute so the page stays in its final state. No AnimatePresence,
 * no library overhead — pure CSS plus a 1-line effect.
 *
 * Why not framer-motion: AnimatePresence + react-router v7's `Routes` needs
 * a `location` prop that this app's `withLayout` wrapper doesn't thread,
 * and the swap-the-tree approach breaks lazy-loaded route boundaries with
 * a flicker. CSS keyframe on attribute change has none of those costs.
 *
 * `prefers-reduced-motion` is honored by the CSS rule — users with reduced
 * motion enabled get the fade only (no translate).
 */
const PageMotion: FC<Props> = ({ children, className }) => {
  const { pathname } = useLocation();
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    setEntering(true);
    // Two rAFs: one to commit the entering state, one to clear it after the
    // browser has had a chance to render the initial keyframe state. The
    // CSS animation handles the actual transition; the attribute is just a
    // trigger.
    let rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => setEntering(false));
    });
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return (
    <div
      data-cloud-page-motion={entering ? 'entering' : 'idle'}
      className={twMerge('cloud-page-motion', className)}
    >
      {children}
    </div>
  );
};

export default PageMotion;
