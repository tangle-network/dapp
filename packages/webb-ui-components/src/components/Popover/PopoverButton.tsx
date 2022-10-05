import * as PopoverPrimitive from '@radix-ui/react-popover';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { PopoverButtonProps } from './types';

/**
 * The `Popover` trigger function, must use inside the `Popover` component
 */
export const PopoverButton = forwardRef<HTMLButtonElement, PopoverButtonProps>(({ className, icon, ...props }, ref) => {
  return (
    <PopoverPrimitive.Trigger asChild>
      <button
        {...props}
        className={twMerge(
          cx(
            'transition-none transition-[border-radius]',
            'px-4 py-2',
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
        {icon && <span className='mr-1'>{icon}</span>}
      </button>
    </PopoverPrimitive.Trigger>
  );
});
