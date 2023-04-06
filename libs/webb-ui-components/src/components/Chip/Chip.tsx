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
export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  (props, ref) => {
    const {
      children,
      className: classNameProp,
      color = 'green',
      isDisabled,
      isSelected,
      ...restProps
    } = props;

    const baseClsx = useMemo(
      () =>
        'box-border inline-flex items-center gap-2 px-3 py-1.5 rounded-full uppercase text-[12px] leading-[15px] font-bold',
      []
    );

    const className = useMemo(() => {
      const { activeOrDisable, selected } = getChipClassName(
        color,
        isDisabled,
        isSelected
      );
      return twMerge(baseClsx, activeOrDisable, selected, classNameProp);
    }, [baseClsx, color, isDisabled, isSelected, classNameProp]);

    return (
      <span className={className} {...restProps} ref={ref}>
        {children}
      </span>
    );
  }
);
