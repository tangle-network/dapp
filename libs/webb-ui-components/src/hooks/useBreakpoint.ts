import useMediaQuery from './useMediaQuery';
import resolveConfig from 'tailwindcss/resolveConfig';

const config = resolveConfig({
  content: [],
});

function useBreakpoint<
  BreakPoints extends Record<string, string>,
  Key extends keyof BreakPoints,
>(breakpoint: Key, breakpoints?: BreakPoints) {
  const breakpointsToUse = breakpoints ?? config.theme.screens;

  const breakPointValue =
    breakpointsToUse[breakpoint as keyof typeof breakpointsToUse] ??
    config.theme.screens['md'];

  return useMediaQuery(`(min-width: ${breakPointValue})`);
}

export default useBreakpoint;
