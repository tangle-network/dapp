import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { CollapsibleContentProps } from './types';

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, ...props }, ref) => {
    return <CollapsiblePrimitive.Content {...props} className={twMerge('p-4', className)} ref={ref} />;
  }
);
