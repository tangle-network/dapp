import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const SelectSeparator = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={twMerge(
      '-mx-1 my-1 h-px bg-mono-60 dark:bg-mono-170',
      className,
    )}
    {...props}
  />
));

SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export default SelectSeparator;
