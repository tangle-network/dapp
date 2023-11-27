'use client';

import useMediaQuery from './useMediaQuery';

type BreakpointRecord = Record<string, number>;

/**
 * Breakpoints from Tailwind
 * @see https://tailwindcss.com/docs/breakpoints
 */
const breakpointsTailwind: BreakpointRecord = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

function useBreakpointValue<
  V,
  BreakPoints extends BreakpointRecord,
  Key extends keyof BreakPoints
>(breakpoint: Key, value: V, fallback: V, breakpoints?: BreakPoints) {
  const breakpointsToUse = breakpoints ?? breakpointsTailwind;
  const breakPointValue =
    breakpointsToUse[breakpoint as string] ?? breakpointsTailwind['md'];

  const isMatched = useMediaQuery(`(min-width: ${breakPointValue}px)`);

  return isMatched ? value : fallback;
}

export default useBreakpointValue;
