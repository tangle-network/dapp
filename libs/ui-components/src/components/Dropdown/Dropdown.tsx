'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { DropdownProps } from './types';

/**
 * The wrapper of Radix `DropdownRoot`
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ children, className, radixRootProps, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge('relative inline-block text-left', className)}
        ref={ref}
      >
        <DropdownMenuPrimitive.Root modal={false} {...radixRootProps}>
          {children}
        </DropdownMenuPrimitive.Root>
      </div>
    );
  },
);
