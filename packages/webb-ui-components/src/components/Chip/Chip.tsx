import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { ChipProps } from './types';
import { getChipClassName } from './utils';

/**
 * The `Chip` component
 *
 * Props:
 *
 * - `color`: The visual style of the badge (default: "green")
 * - `isDisabled`: If `true`, the chip will display as disabled state
 *
 * @example
 *
 * ```jsx
 *  <Chip>Active</Chip>
 *  <Chip color="red" isDisabled>Disabled</Chip>
 * ```
 */
export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>((props, ref) => {
  const { children, className: classNameProp, color = 'green', isDisabled } = props;

  const baseClsx = useMemo(() => 'box-border inline-block px-3 py-1 rounded-full utility uppercase', []);

  const className = useMemo(
    () => twMerge(baseClsx, getChipClassName(color, isDisabled), classNameProp),
    [baseClsx, color, isDisabled, classNameProp]
  );

  return (
    <span className={className} ref={ref}>
      {children}
    </span>
  );
});
