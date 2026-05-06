import useMediaQuery from './useMediaQuery';
import resolveConfig from 'tailwindcss/resolveConfig';

const config = resolveConfig({
  content: [],
});

type TailwindBreakpoint = keyof typeof config.theme.screens;

function useIsBreakpoint(breakpoint: TailwindBreakpoint, reverse = false) {
  const breakpointValue = config.theme.screens[breakpoint];
  const query = reverse ? 'max' : 'min';

  return useMediaQuery(`(${query}-width: ${breakpointValue})`);
}

export default useIsBreakpoint;
