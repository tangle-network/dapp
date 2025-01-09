import * as SelectPrimitive from '@radix-ui/react-select';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const SelectLabel = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={twMerge('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
    {...props}
  />
));

SelectLabel.displayName = SelectPrimitive.Label.displayName;

export default SelectLabel;
