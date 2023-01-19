import { PropsOf } from '../../types';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

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

export const BridgeInputGroup = forwardRef<HTMLDivElement, PropsOf<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'p-2 bg-mono-20 dark:bg-mono-160 rounded-lg',
          className
        )}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);
