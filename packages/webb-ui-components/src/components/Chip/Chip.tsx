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
export const Chip: React.FC<ChipProps> = (props) => {
  const { children, className, color = 'green', isDisabled } = props;

  const baseClsx = useMemo(() => 'box-border inline-block px-3 py-1 rounded-full font-bold body4', []);

  const _className = useMemo(
    () => twMerge(baseClsx, getChipClassName(color, isDisabled), className),
    [baseClsx, color, isDisabled, className]
  );

  return <span className={_className}>{children}</span>;
};
