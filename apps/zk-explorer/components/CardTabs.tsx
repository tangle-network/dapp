import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { SearchSortByClause } from '../api/circuits';
import useTailwindBreakpoint from '../hooks/useTailwindBreakpoint';
import { ItemType } from '../utils';
import FilterAndSortBy from './FilterAndSortBy';
import { FilterConstraints } from './Filters/types';
import { SmallChip } from './SmallChip';

export type CardTabsProps = {
  selectedTab: ItemType;
  counts: Record<ItemType, number>;
  sortByClause: SearchSortByClause;
  onTabChange: (cardType: ItemType) => void;
  onSortByClauseChange: (sortByClause: SearchSortByClause) => void;
  onConstraintsChange: (constraints: FilterConstraints) => void;
};

export const CardTabs: FC<CardTabsProps> = ({
  selectedTab,
  counts,
  sortByClause,
  onTabChange,
  onSortByClauseChange,
  onConstraintsChange,
}) => {
  const breakpoint = useTailwindBreakpoint();

  return (
    <div className="flex gap-6 sm:gap-0 align-center flex-col sm:flex-row">
      {/* Tabs */}
      <div className="inline-flex gap-4 w-full">
        {Object.values(ItemType).map((cardType) => {
          const isSelected = cardType === selectedTab;

          return (
            <div
              key={cardType}
              className={twMerge(
                'flex justify-center items-center gap-2 py-1 border-b border-transparent w-full sm:w-auto sm:justify-start',
                isSelected
                  ? 'border-mono-200 dark:border-mono-0'
                  : 'cursor-pointer'
              )}
              onClick={() => {
                if (!isSelected) {
                  onTabChange(cardType);
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
                {cardType}
              </Typography>

              <SmallChip>{counts[cardType]}</SmallChip>
            </div>
          );
        })}
      </div>

      {/* Filter & Sort by */}
      <FilterAndSortBy
        onSortByClauseChange={onSortByClauseChange}
        sortByClause={sortByClause}
        onConstraintsChange={onConstraintsChange}
      />
    </div>
  );
};
