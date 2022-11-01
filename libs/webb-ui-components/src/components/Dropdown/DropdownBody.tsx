import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { DropdownBodyProps } from './types';

/**
 * The style wrapper around Radix `Content` and `Portal` component, must use inside the `Dropdown` component
 */
export const DropdownBody = forwardRef<HTMLDivElement, DropdownBodyProps>(
  ({ children, className, size, ...props }, ref) => {
    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          {...props}
          align='end'
          sideOffset={size === 'sm' ? 8 : 0}
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
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    );
  }
);
