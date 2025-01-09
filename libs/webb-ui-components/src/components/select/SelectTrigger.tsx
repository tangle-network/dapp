import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={twMerge(
      'flex h-10 w-full items-center justify-between rounded-md',
      'border border-mono-60 dark:border-mono-140 bg-mono-0/10 dark:bg-mono-0/5 px-3 py-2 text-sm',
      'ring-offset-mono-60 dark:ring-offset-mono-140',
      'focus:outline-none focus:ring-2 focus:ring-purple-40 dark:focus:ring-purple-50 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon className="w-4 h-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export default SelectTrigger;
