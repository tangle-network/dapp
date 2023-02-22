import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { DropdownBodyProps } from './types';

/**
 * The style wrapper around Radix `Content` and `Portal` component, must use inside the `Dropdown` component
 */
export const DropdownBody = forwardRef<HTMLDivElement, DropdownBodyProps>(
  ({ children, className, size, isPorttal = true, ...props }, ref) => {
    if (isPorttal) {
      return (
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            {...props}
            sideOffset={size === 'sm' ? 8 : 0}
            className={twMerge(
              cx(
                'radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down',
                'min-w-[176px] shadow-md overflow-hidden webb-shadow-md',
                size === 'md'
                  ? 'rounded-b-lg border border-t-0'
                  : 'rounded-lg border',
                'border-mono-80 dark:border-mono-120',
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

    return (
      <DropdownMenuPrimitive.Content
        align="end"
        {...props}
        sideOffset={size === 'sm' ? 8 : 0}
        className={twMerge(
          cx(
            'radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down',
            'min-w-[176px] shadow-md overflow-hidden webb-shadow-md',
            size === 'md'
              ? 'rounded-b-lg border border-t-0'
              : 'rounded-lg border',
            'border-mono-80 dark:border-mono-120',
            'bg-mono-0 dark:bg-mono-200'
          ),
          className
        )}
        ref={ref}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    );
  }
);
