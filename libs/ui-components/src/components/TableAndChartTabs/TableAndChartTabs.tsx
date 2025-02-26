import { cloneElement, FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { TabsRoot, TabsList, TabTrigger } from '../Tabs';
import { Typography } from '../../typography';
import { TableAndChartTabsProps } from './types';

const BLANK_TAB_VALUE = 'blank-tab';

export const TableAndChartTabs: FC<TableAndChartTabsProps> = ({
  tabs,
  icons,
  additionalActionsCmp,
  className,
  headerClassName,
  listClassName,
  triggerClassName,
  triggerTypographyVariant = 'h5',
  enableAdvancedDivider = false,
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
          headerClassName,
        )}
      >
        {/* Tabs List on the left */}
        <TabsList className={twMerge('space-x-4 w-full', listClassName)}>
          {tabs.map((tab, idx) => {
            return (
              <TabTrigger
                key={idx}
                value={tab}
                isDisableStyle
                className={twMerge(
                  'text-mono-100 radix-state-active:text-mono-200',
                  'dark:radix-state-active:!text-mono-0',
                  'flex gap-2 items-center',
                  triggerClassName,
                )}
              >
                {
                  icons?.[idx] && (
                    cloneElement(icons[idx], {
                      // other props
                    })
                  )
                }
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

          {enableAdvancedDivider && (
            <TabTrigger
              value={BLANK_TAB_VALUE}
              isDisableStyle
              className={twMerge(
                'border-b-2 border-mono-170 py-4 !ml-0 flex-grow'
              )}
            >
               <Typography
                  variant={triggerTypographyVariant}
                  className="!text-transparent"
                >
                  {BLANK_TAB_VALUE}
                </Typography>
            </TabTrigger>
          )}
        </TabsList>

        {/* Component on the right */}
        {additionalActionsCmp}
      </div>

      {/* Tabs Content */}
      {children}
    </TabsRoot>
  );
};
