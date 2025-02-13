import { ReactNode } from 'react';
import * as Tabs from '@radix-ui/react-tabs';

import type { WebbTypographyProps } from '../../typography/types';

export interface TableAndChartTabsProps extends Tabs.TabsProps {
  /**
   * The list of value for the tabs
   */
  tabs: string[];

  /**
   * Components on the right side of the tabs to perform additional actions (optional)
   */
  additionalActionsCmp?: ReactNode;

  /**
   * The className for the whole component (optional)
   */
  className?: string;

  /**
   * The className for header, including the trigger list and the filter component (optional)
   */
  headerClassName?: string;

  /**
   * The className for the trigger list (optional)
   */
  listClassName?: string;

  /**
   * The className for trigger items (optional)
   */
  triggerClassName?: string;

  /**
   * The variant for the trigger text (optional)
   * @default 'h5'
   */
  triggerTypographyVariant?: WebbTypographyProps['variant'];
}
