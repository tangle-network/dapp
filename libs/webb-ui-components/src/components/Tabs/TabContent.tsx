import * as Tabs from '@radix-ui/react-tabs';

import { forwardRef } from 'react';

/**
 * The wrapper around the Radix TabContent component
 */
export const TabContent = forwardRef<HTMLDivElement, Tabs.TabsContentProps>(
  (props, ref) => {
    return <Tabs.Content {...props} ref={ref} />;
  }
);
