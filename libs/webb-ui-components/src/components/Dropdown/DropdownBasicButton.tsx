import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';

import { DropdownButtonProps } from './types';

/**
 * The `DropdownMenu` trigger function, must use inside the `Dropdown` component
 */
export const DropdownBasicButton = forwardRef<HTMLButtonElement, DropdownButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <DropdownMenuPrimitive.Trigger asChild>
        <button {...props} className={className} ref={ref}>
          {children}
        </button>
      </DropdownMenuPrimitive.Trigger>
    );
  }
);
