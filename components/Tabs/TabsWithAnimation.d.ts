import { ComponentProps } from '../../../../../node_modules/react';
import * as Tabs from '@radix-ui/react-tabs';
export declare const TabsListWithAnimation: import('../../../../../node_modules/react').ForwardRefExoticComponent<Omit<Tabs.TabsListProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>, "ref"> & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
type TabsTriggerWithAnimationProps = ComponentProps<typeof Tabs.Trigger> & {
    isActive: boolean;
    hideSeparator?: boolean;
};
export declare const TabsTriggerWithAnimation: import('../../../../../node_modules/react').ForwardRefExoticComponent<Omit<TabsTriggerWithAnimationProps, "ref"> & import('../../../../../node_modules/react').RefAttributes<HTMLButtonElement>>;
export {};
