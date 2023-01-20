import * as PopoverPrimitive from '@radix-ui/react-popover';
import { forwardRef } from 'react';

import { PopoverCloseProps } from './types';

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
  (props, ref) => {
    return <PopoverPrimitive.Close {...props} ref={ref} />;
  }
);
