import * as Tabs from '@radix-ui/react-tabs';

import { forwardRef } from 'react';
import { Tab } from './Tabs';
import { TabBaseProps } from './types';

/**
 * The wrapper around the Radix TabTrigger component
 */
export const TabTrigger = forwardRef<
  HTMLButtonElement,
  Tabs.TabsTriggerProps & TabBaseProps
>(({ children, isDisableStyle, ...props }, ref) => {
  return (
    <Tabs.Trigger asChild={!isDisableStyle} {...props} ref={ref}>
      {!isDisableStyle ? (
        <Tab isActive={props.disabled}>{children}</Tab>
      ) : (
        children
      )}
    </Tabs.Trigger>
  );
});
