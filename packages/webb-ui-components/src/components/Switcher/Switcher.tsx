import * as SwitchPrimitive from '@radix-ui/react-switch';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { SwitcherProps } from './types';

export const Switcher = forwardRef<HTMLButtonElement, SwitcherProps>(({ className, ...props }, ref) => {
  const mergedClxs = useMemo(
    () =>
      twMerge(
        cx(
          'group',
          'radix-state-checked:bg-blue-10 dark:radix-state-checked:bg-blue-90',
          'radix-state-unchecked:bg-mono-80 dark:radix-state-unchecked:bg-mono-140',
          'relative inline-flex h-[6px] w-[28px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75',
          'radix-disabled:pointer-events-none radix-disabled:bg-mono-40 dark:radix-disabled:bg-mono-120'
        ),
        className
      ),
    [className]
  );

  return (
    <SwitchPrimitive.Root {...props} ref={ref} className={mergedClxs}>
      <SwitchPrimitive.Thumb
        className={cx(
          'group-radix-state-checked:translate-x-3',
          'group-radix-state-unchecked:translate-x-0',
          'group-radix-state-checked:bg-blue-70 dark:group-radix-state-checked:bg-blue-50',
          'absolute inline-block top-1/2 -translate-y-1/2',
          'shadow-[0_1px_4px_0_rgba(0,0,0,0.35)] dark:shadow-[0_2px_4px_0_rgba(6,6,6,0.35)]',
          'group-hover:shadow-[0_2px_4px_1px_rgba(0,0,0,0.35)] dark:group-hover:shadow-[0_3px_4px_2px_rgba(6,6,6,0.35)]',
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-mono-0 dark:bg-mono-40 transition duration-200 ease-in-out',
          'radix-disabled:bg-mono-20 dark:radix-disabled:bg-mono-140'
        )}
      />
    </SwitchPrimitive.Root>
  );
});
