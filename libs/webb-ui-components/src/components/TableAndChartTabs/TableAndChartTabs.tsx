import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { TabsRoot, TabsList, TabTrigger } from '../Tabs';
import { Typography } from '../../typography';
import { TableAndChartTabsProps } from './types';

export const TableAndChartTabs: FC<TableAndChartTabsProps> = ({
  tabs,
  filterComponent,
  className,
  headerClassName,
  listClassName,
  triggerClassName,
  triggerTypographyVariant = 'h5',
  children,
  ...tabsProps
}) => {
  return (
    <TabsRoot
      defaultValue={tabs[0]}
      className={twMerge('space-y-4', className)}
      {...tabsProps}
    >
      <div
        className={twMerge(
          'flex justify-between items-center gap-4',
          headerClassName
        )}
      >
        {/* Tabs List on the left */}
        <TabsList className={twMerge('space-x-4', listClassName)}>
          {tabs.map((tab, idx) => {
            return (
              <TabTrigger
                key={idx}
                value={tab}
                isDisableStyle
                className={twMerge(
                  'text-mono-100 radix-state-active:text-mono-200',
                  'dark:radix-state-active:!text-mono-0',
                  triggerClassName
                )}
              >
                <Typography
                  variant={triggerTypographyVariant}
                  fw="bold"
                  className="!text-inherit"
                >
                  {tab}
                </Typography>
              </TabTrigger>
            );
          })}
        </TabsList>

        {/* Component on the right */}
        {filterComponent}
      </div>

      {/* Tabs Content */}
      {children}
    </TabsRoot>
  );
};
