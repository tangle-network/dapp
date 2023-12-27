import { FC, useEffect, useState } from 'react';
import {
  Dropdown,
  DropdownBody,
  Typography,
  DropdownBasicButton,
  MenuItem,
  Button,
} from '@webb-tools/webb-ui-components';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, FilterIcon2 } from '@webb-tools/icons';
import { ItemType } from '../utils/utils';
import { CheckCircledIcon, CircleIcon } from '@radix-ui/react-icons';
import { SearchSortByClause } from '../utils/api';
import { SmallChip } from './SmallChip';
import useTailwindBreakpoint, {
  TailwindBreakpoint,
} from '../hooks/useTailwindBreakpoint';
import { MobileFiltersSidebar } from './MobileFiltersSidebar';
import { FilterConstraints } from './Filters/types';

export type CardTabsProps = {
  selectedTab: ItemType;
  counts: Record<ItemType, number>;
  sortByClause: SearchSortByClause;
  onTabChange: (cardType: ItemType) => void;
  onSortByClauseChange: (sortByClause: SearchSortByClause) => void;
  onMobileConstraintsChange: (constraints: FilterConstraints) => void;
};

export const CardTabs: FC<CardTabsProps> = ({
  selectedTab,
  counts,
  sortByClause,
  onTabChange,
  onSortByClauseChange,
  onMobileConstraintsChange,
}) => {
  const breakpoint = useTailwindBreakpoint();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <>
      {isMobileSidebarOpen && breakpoint <= TailwindBreakpoint.SM && (
        <MobileFiltersSidebar onClose={() => setIsMobileSidebarOpen(false)} />
      )}

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
        <div className="flex items-center md:ml-auto w-full">
          <Dropdown className="flex justify-end w-full">
            <div className="flex gap-2 w-full sm:w-auto">
              <DropdownBasicButton className="w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="utility"
                  className="w-full sm:w-auto"
                  isFullWidth={breakpoint <= TailwindBreakpoint.SM}
                  rightIcon={
                    <ChevronDown className="dark:fill-blue-50" size="lg" />
                  }
                >
                  <Typography
                    variant="body4"
                    fw="bold"
                    className="dark:text-blue-50"
                  >
                    {sortByClause}
                  </Typography>
                </Button>
              </DropdownBasicButton>

              <Button
                size="sm"
                variant="utility"
                className="sm:hidden w-full"
                isFullWidth
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                rightIcon={
                  <FilterIcon2 className="dark:fill-blue-50" size="lg" />
                }
              >
                <Typography
                  variant="body4"
                  fw="bold"
                  className="dark:text-blue-50 w-full"
                >
                  Filter
                </Typography>
              </Button>
            </div>

            <DropdownBody className="mt-6 w-[280px] dark:bg-mono-180">
              <div className="px-4 py-2 hover:bg-mono-0 dark:hover:bg-mono-180">
                <Typography variant="label" fw="bold">
                  Sort by
                </Typography>
              </div>

              {Object.values(SearchSortByClause).map((clause, index) => {
                const isSelected = clause === sortByClause;

                return (
                  <MenuItem
                    className={isSelected ? 'cursor-default' : ''}
                    key={index}
                    disabled={isSelected}
                    onClick={() => onSortByClauseChange(clause)}
                    icon={isSelected ? <CheckCircledIcon /> : <CircleIcon />}
                  >
                    {clause}
                  </MenuItem>
                );
              })}
            </DropdownBody>
          </Dropdown>
        </div>
      </div>
    </>
  );
};
