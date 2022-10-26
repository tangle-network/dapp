import { ComponentProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { Dropdown } from '../Dropdown/Dropdown';
import { NavigationMenuProps } from './types';

/**
 * The NavigationMenu wrapper, wrap the navigation menu button and navigation menu content
 */
export const NavigationMenu = forwardRef<HTMLDivElement, NavigationMenuProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Dropdown {...props} className={twMerge('flex items-center justify-center', className)} ref={ref}>
        {children}
      </Dropdown>
    );
  }
);
