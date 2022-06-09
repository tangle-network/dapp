import { useDimensions } from '@webb-dapp/react-environment/layout';
import { useMemo } from 'react';

import { size } from './break-points.util';

export default () => {
  const { width } = useDimensions();

  const isXsOrAbove = useMemo(() => width >= size.xs, [width]);
  const isSmOrAbove = useMemo(() => width >= size.sm, [width]);
  const isMdOrAbove = useMemo(() => width >= size.md, [width]);
  const isLgOrAbove = useMemo(() => width >= size.lg, [width]);
  const isXlOrAbove = useMemo(() => width >= size.xl, [width]);

  return {
    breakpoints: size,
    isXsOrAbove,
    isSmOrAbove,
    isMdOrAbove,
    isLgOrAbove,
    isXlOrAbove,
  };
};
