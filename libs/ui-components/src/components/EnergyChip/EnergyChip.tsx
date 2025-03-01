import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { EnergyChipColors, EnergyChipProps } from './types';
import { getEnergyChipClassName } from './utils';

/**
 * The `EnergyChip` component
 *
 * Props:
 *
 * - `color`: The visual style of the energy chip (default: "green")
 *
 * @example
 *
 * ```jsx
 *  <EnergyChip color="green">Active</EnergyChip>
 *  <EnergyChip color="grey">Disabled</EnergyChip>
 *  <EnergyChip color="dark-grey">Disabled</EnergyChip>
 * ```
 */
export const EnergyChip = forwardRef<HTMLSpanElement, EnergyChipProps>(
  (props, ref) => {
    const {
      children,
      className: classNameProp,
      color = EnergyChipColors.GREEN,
      ...restProps
    } = props;

    const baseClsx = 'rounded-full h-5 w-1';

    const className = useMemo(() => {
      const activeOrDisable = getEnergyChipClassName(color);

      return twMerge(baseClsx, activeOrDisable, classNameProp);
    }, [baseClsx, color, classNameProp]);

    return (
      <span className={className} {...restProps} ref={ref}>
        {children}
      </span>
    );
  },
);
