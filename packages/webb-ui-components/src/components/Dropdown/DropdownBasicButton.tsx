import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from '@webb-dapp/webb-ui-components/icons';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

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
