import * as PopoverPrimitive from '@radix-ui/react-popover';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { PopoverProps } from './types';

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(({ children, className, ...props }, ref) => {
  return (
    <div {...props} className={twMerge('relative inline-block text-left', className)} ref={ref}>
      <PopoverPrimitive.Root>{children}</PopoverPrimitive.Root>
    </div>
  );
});
