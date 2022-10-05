import * as PopoverPrimitive from '@radix-ui/react-popover';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { PopoverBodyProps } from './types';

/**
 * The style wrapper around Radix `Content` and `Portal` component, must use inside the `Popover` component
 */
export const PopoverBody = forwardRef<HTMLDivElement, PopoverBodyProps>(
  ({ children, className, size, ...props }, ref) => {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          {...props}
          align='end'
          className={twMerge(
            cx(
              'radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down',
              'min-w-[176px] shadow-md overflow-hidden webb-shadow-md',
              size === 'md' ? 'rounded-b-lg border border-t-0' : 'rounded-lg border',
              'border-blue-40 dark:border-blue-70',
              'bg-mono-0 dark:bg-mono-200'
            ),
            className
          )}
          ref={ref}
        >
          {children}
          <PopoverPrimitive.Close />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }
);
