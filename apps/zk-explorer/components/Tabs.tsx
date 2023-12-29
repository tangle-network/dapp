import { Typography } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { SearchSortByClause } from '../utils/api';
import { FilterConstraints } from './Filters/types';
import { SmallChip } from './SmallChip';

export type Tab = {
  name: string;
  count?: number;
};

export type TabsProps = {
  selectedTabIndex: number;
  tabs: Tab[];
  sortByClause: SearchSortByClause;
  rightContent?: React.ReactNode;
  onTabChange: (tab: Tab, index: number) => void;
  onSortByClauseChange: (sortByClause: SearchSortByClause) => void;
  onConstraintsChange: (constraints: FilterConstraints) => void;
};

export const Tabs: FC<TabsProps> = ({
  selectedTabIndex,
  tabs,
  rightContent,
  onTabChange,
}) => {
  assert(
    selectedTabIndex >= 0 && selectedTabIndex < tabs.length,
    'Selected tab index is out of range'
  );

  assert(
    tabs.length > 0,
    'At least one tab must be provided, otherwise there would be nothing to render'
  );

  return (
    <div className="flex gap-6 sm:gap-0 align-center flex-col sm:flex-row">
      {/* Tabs */}
      <div className="inline-flex gap-4 w-full">
        {tabs.map((tab, index) => {
          const isSelected = index === selectedTabIndex;

          return (
            <div
              key={index}
              className={twMerge(
                'flex justify-center items-center gap-2 py-1 border-b border-transparent w-full sm:w-auto sm:justify-start',
                isSelected
                  ? 'border-mono-200 dark:border-mono-0'
                  : 'cursor-pointer'
              )}
              onClick={() => {
                if (!isSelected) {
                  onTabChange(tab, index);
                }
              }}
            >
              <Typography
                variant="h5"
                fw="bold"
                className={
                  isSelected
                    ? 'dark:text-mono-0'
                    : 'text-mono-100 dark:text-mono-100'
                }
              >
                {tab.name}
              </Typography>

              {tab.count !== undefined && <SmallChip>{tab.count}</SmallChip>}
            </div>
          );
        })}
      </div>

      {rightContent}
    </div>
  );
};
