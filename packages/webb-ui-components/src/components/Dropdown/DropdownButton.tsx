import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { DropdownButtonProps } from './types';

/**
 * The `DropdownMenu` trigger function, must use inside the `Dropdown` component
 */
export const DropdownButton = forwardRef<HTMLButtonElement, DropdownButtonProps>(
  ({ className, icon, label, size, ...props }, ref) => {
    return (
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          {...props}
          className={twMerge(
            cx(
              'form-select border rounded-lg',
              'transition-none transition-[border-radius]',
              'px-4 py-2',
              size === 'md' ? 'min-w-[176px]' : 'min-w-[96px]',
              'flex items-center',
              'bg-mono-0 dark:bg-mono-200',
              'border-mono-80 dark:border-mono-120',
              'text-mono-140 dark:text-mono-80',
              'hover:border-blue-40 dark:hover:border-blue-70',
              'radix-state-open:border-blue-40 dark:radix-state-open:border-blue-70',
              'radix-state-open:bg-blue-0 dark:radix-state-open:bg-blue-120',
              'radix-state-open:rounded-t-lg',
              'radix-state-open:rounded-b-none'
            ),
            className
          )}
          ref={ref}
        >
          {icon && <span className='mr-1 text-inherit'>{icon}</span>}
          <span className={cx('text-inherit', size === 'md' ? 'body1' : 'font-bold body4')}>{label}</span>
        </button>
      </DropdownMenuPrimitive.Trigger>
    );
  }
);
