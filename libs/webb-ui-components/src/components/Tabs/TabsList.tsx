import * as Tabs from '@radix-ui/react-tabs';

import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { TabBaseProps } from './types';

/**
 * The wrapper around the Radix TabsList component
 */
export const TabsList = forwardRef<
  HTMLDivElement,
  Tabs.TabsListProps & TabBaseProps
>(({ className, isDisableStyle, ...props }, ref) => {
  return (
    <Tabs.List
      {...props}
      className={twMerge(
        cx({ 'flex items-center space-x-2': !isDisableStyle }),
        className
      )}
      ref={ref}
    />
  );
});
