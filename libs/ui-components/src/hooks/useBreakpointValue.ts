import useMediaQuery from './useMediaQuery';
import resolveConfig from 'tailwindcss/resolveConfig';

const config = resolveConfig({
  content: [],
});

function useBreakpointValue<
  BreakPoints extends Record<string, string>,
  Key extends keyof BreakPoints,
  V = unknown,
>(breakpoint: Key, value: V, fallback: V, breakpoints?: BreakPoints) {
  const breakpointsToUse = breakpoints ?? config.theme.screens;

  const breakPointValue =
    breakpointsToUse[breakpoint as keyof typeof breakpointsToUse] ??
    config.theme.screens['md'];

  const isMatched = useMediaQuery(`(min-width: ${breakPointValue})`);

  return isMatched ? value : fallback;
}

export default useBreakpointValue;
