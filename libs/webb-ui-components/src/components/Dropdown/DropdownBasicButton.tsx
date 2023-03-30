import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { DropdownButtonProps } from './types';

/**
 * The `DropdownMenu` trigger function, must use inside the `Dropdown` component
 */
export const DropdownBasicButton = forwardRef<
  HTMLButtonElement,
  DropdownButtonProps
>(({ children, className, isFullWidth, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Trigger asChild>
      <button
        {...props}
        className={twMerge(cx({ 'block w-full': isFullWidth }), className)}
        ref={ref}
      >
        {children}
      </button>
    </DropdownMenuPrimitive.Trigger>
  );
});
