import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from '../../icons';
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
              'border rounded-lg uppercase group',
              'transition-none transition-[border-radius]',
              'pl-4 py-2',
              size === 'md' ? 'min-w-[176px]' : 'min-w-[96px]',
              'flex items-center justify-between',
              'bg-mono-0 dark:bg-mono-180',
              'border-mono-80 dark:border-mono-120',
              'text-mono-140 dark:text-mono-40',
              'hover:border-blue-40 dark:hover:border-blue-70',
              'radix-state-open:border-blue-40 dark:radix-state-open:border-blue-70',
              'radix-state-open:bg-blue-0 dark:radix-state-open:bg-blue-120',
              size !== 'sm' && 'radix-state-open:rounded-t-lg',
              size !== 'sm' && 'radix-state-open:rounded-b-none'
            ),
            className
          )}
          ref={ref}
        >
          <div className='flex items-center space-x-1'>
            {icon && <span className='text-inherit'>{icon}</span>}
            <span className={cx('text-inherit', size === 'md' ? 'body1' : 'utility')}>{label}</span>
          </div>
          <ChevronDown className='mx-2 transition-transform duration-300 ease-in-out group-radix-state-open:rotate-180' />
        </button>
      </DropdownMenuPrimitive.Trigger>
    );
  }
);
