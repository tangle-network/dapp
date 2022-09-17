import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { DividerProps } from './types';

export const Divider = forwardRef<HTMLDivElement, DividerProps>(({ className, ...props }, ref) => {
  return (
    <SeparatorPrimitive.Root
      {...props}
      className={twMerge(
        'bg-mono-40',
        'radix-orientation-horizontal:h-[1px] radix-orientation-horizontal:w-full',
        'radix-orientation-vertical:h-full radix-orientation-vertical:w-[1px]',
        className
      )}
      ref={ref}
    />
  );
});
