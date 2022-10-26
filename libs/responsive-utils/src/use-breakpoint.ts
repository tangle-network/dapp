import { useDimensions } from './layout';
import { useMemo } from 'react';

import { size } from './break-points.util';

export const useBreakpoint = () => {
  const { width } = useDimensions();

  const breakpoints = useMemo(
    () => ({
      breakpoints: size,
      isXsOrAbove: width >= size.xs,
      isSmOrAbove: width >= size.sm,
      isMdOrAbove: width >= size.md,
      isLgOrAbove: width >= size.lg,
      isXlOrAbove: width >= size.xl,
    }),
    [width]
  );

  return breakpoints;
};
