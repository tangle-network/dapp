'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';
import { DropdownButtonProps } from './types';

/**
 * The `DropdownMenu` trigger function, must use inside the `Dropdown` component
 */
export const DropdownBasicButton = forwardRef<
  HTMLButtonElement,
  DropdownButtonProps
>(({ children, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Trigger {...props} ref={ref}>
      {children}
    </DropdownMenuPrimitive.Trigger>
  );
});
