import * as Tabs from '@radix-ui/react-tabs';

import { forwardRef } from 'react';
import { Tab } from './Tabs';

/**
 * The wrapper around the Radix TabTrigger component
 */
export const TabTrigger = forwardRef<HTMLButtonElement, Tabs.TabsTriggerProps>(
  ({ children, ...props }, ref) => {
    return (
      <Tabs.Trigger {...props} ref={ref} asChild>
        <Tab isActive={props.disabled}>{children}</Tab>
      </Tabs.Trigger>
    );
  }
);
