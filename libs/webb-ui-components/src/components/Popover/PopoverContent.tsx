import * as PopoverPrimitive from '@radix-ui/react-popover';
import { forwardRef } from 'react';

import { PopoverContentProps } from './types';

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  (props, ref) => {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content {...props} ref={ref} />
      </PopoverPrimitive.Portal>
    );
  }
);
