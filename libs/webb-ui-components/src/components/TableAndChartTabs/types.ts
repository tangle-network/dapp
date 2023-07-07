import { ReactNode } from 'react';
import * as Tabs from '@radix-ui/react-tabs';

export type TableAndChartTabType = {
  value: string;
  component: ReactNode;
};

export interface TableAndChartTabsProps extends Tabs.TabsProps {
  tabs: TableAndChartTabType[];
  filterComponent?: ReactNode;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
}
