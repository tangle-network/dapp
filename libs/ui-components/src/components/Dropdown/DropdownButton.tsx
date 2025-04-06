'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from '@tangle-network/icons';
import { cloneElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { DropdownButtonProps } from './types';

/**
 * The `DropdownMenu` trigger function, must use inside the `Dropdown` component
 */
export const DropdownButton = forwardRef<
  HTMLButtonElement,
  DropdownButtonProps
>(
  (
    {
      className,
      icon,
      isHideArrowIcon,
      children,
      arrowElement = (
        <ChevronDown
          size="lg"
          className="transition-transform duration-300 ease-in-out enabled:group-radix-state-open:rotate-180"
        />
      ),
      ...props
    },
    ref,
  ) => {
    return (
      <DropdownMenuPrimitive.Trigger
        {...props}
        className={twMerge(
          'border rounded-lg p-2',
          'flex items-center gap-2',
          'bg-mono-0/10 dark:bg-mono-0/5',
          'enabled:hover:bg-mono-100/10 enabled:dark:hover:bg-mono-0/10',
          'border-2 border-mono-60 dark:border-mono-140',
          '[&_svg]:shrink-0',
          className,
        )}
        ref={ref}
      >
        {icon}

        {children}

        {!isHideArrowIcon &&
          cloneElement(arrowElement, {
            className: twMerge(arrowElement?.props?.className, 'ml-auto'),
          })}
      </DropdownMenuPrimitive.Trigger>
    );
  },
);
