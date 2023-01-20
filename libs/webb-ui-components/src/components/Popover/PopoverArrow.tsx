import * as PopoverPrimitive from '@radix-ui/react-popover';
import { forwardRef } from 'react';

import { PopverArrowProps } from './types';

export const PopoverArrow = forwardRef<SVGSVGElement, PopverArrowProps>(
  (props, ref) => {
    return <PopoverPrimitive.Arrow {...props} ref={ref} />;
  }
);
