import * as Tabs from '@radix-ui/react-tabs';

import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * The wrapper around the Radix TabsList component
 */
export const TabsList = forwardRef<HTMLDivElement, Tabs.TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <Tabs.List
        {...props}
        className={twMerge('flex items-center space-x-2', className)}
        ref={ref}
      />
    );
  }
);
