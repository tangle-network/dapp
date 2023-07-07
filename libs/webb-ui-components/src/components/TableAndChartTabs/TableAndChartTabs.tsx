import { FC } from 'react';
import cx from 'classnames';

import { TabsRoot, TabContent, TabsList, TabTrigger } from '../Tabs';
import { Typography } from '../../typography';
import { TableAndChartTabsProps } from './types';

export const TableAndChartTabs: FC<TableAndChartTabsProps> = ({
  tabs,
  filterComponent,
  className,
  listClassName,
  triggerClassName,
  ...tabsProps
}) => {
  return (
    <TabsRoot
      defaultValue={tabs[0].value}
      className={cx('space-y-4', className)}
      {...tabsProps}
    >
      <div className="flex justify-between items-center">
        {/* Tabs List on the left */}
        <TabsList className={cx('space-x-4', listClassName)}>
          {tabs.map((tab, idx) => {
            return (
              <TabTrigger
                key={idx}
                value={tab.value}
                isDisableStyle
                className={cx(
                  'text-mono-100 radix-state-active:text-mono-200',
                  'dark:radix-state-active:!text-mono-0',
                  triggerClassName
                )}
              >
                <Typography
                  variant="mkt-body2"
                  fw="black"
                  className="!text-current"
                >
                  {tab.value}
                </Typography>
              </TabTrigger>
            );
          })}
        </TabsList>

        {/* Component on the right */}
        {filterComponent}
      </div>

      {/* Tabs Content */}
      {tabs.map((tab, idx) => (
        <TabContent key={idx} value={tab.value}>
          {tab.component}
        </TabContent>
      ))}
    </TabsRoot>
  );
};
