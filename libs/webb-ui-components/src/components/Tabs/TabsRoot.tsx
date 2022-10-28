import * as Tabs from '@radix-ui/react-tabs';

import { forwardRef } from 'react';

/**
 * The wrapper around the Radix TabsRoot component
 */
export const TabsRoot = forwardRef<HTMLDivElement, Tabs.TabsProps>(
  (props, ref) => {
    return <Tabs.Root {...props} ref={ref} />;
  }
);
