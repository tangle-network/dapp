import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { BridgeInputGroupProps } from './types';

/**
 * The `BridgeInputGroup` component
 *
 * Props:
 *
 * - `children`: Consumes component children
 *
 * @example
 *
 * ```jsx
 * <BridgeInputGroup>
 *   <AmountInput  />
 * </BridgeInputGroup>
 * ```
 */

export const BridgeInputGroup = forwardRef<HTMLDivElement, BridgeInputGroupProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div {...props} className={twMerge('p-2 bg-mono-20 dark:bg-mono-160 rounded-lg', className)} ref={ref}>
        {children}
      </div>
    );
  }
);
