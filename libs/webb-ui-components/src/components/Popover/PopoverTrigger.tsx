import * as PopoverPrimitive from '@radix-ui/react-popover';
import { forwardRef } from 'react';

import { PopoverTriggerProps } from './types';

export const PopoverTrigger = forwardRef<
  HTMLButtonElement,
  PopoverTriggerProps
>((props, ref) => {
  return <PopoverPrimitive.Trigger {...props} ref={ref} />;
});
