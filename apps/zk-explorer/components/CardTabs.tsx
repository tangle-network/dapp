'use client';

import { CheckCircledIcon, CircleIcon } from '@radix-ui/react-icons';
import { ChevronDown, FilterIcon2 } from '@webb-tools/icons';
import {
  Button,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { useSidebarContext } from '../hooks/useSidebarContext';
import useTailwindBreakpoint, {
  TailwindBreakpoint,
} from '../hooks/useTailwindBreakpoint';
import { SearchSortByClause } from '../utils/api';
import { ItemType } from '../utils/utils';
import { Filters } from './Filters/Filters';
import { SmallChip } from './SmallChip';

export type CardTabsProps = {
  selectedTab: ItemType;
  counts: Record<ItemType, number>;
  sortByClause: SearchSortByClause;
  onTabChange: (cardType: ItemType) => void;
  onSortByClauseChange: (sortByClause: SearchSortByClause) => void;
};

export const CardTabs: FC<CardTabsProps> = ({
  selectedTab,
  counts,
  sortByClause,
  onTabChange,
  onSortByClauseChange,
}) => {
  const breakpoint = useTailwindBreakpoint();
  const { setSidebarOpen, updateSidebarContent } = useSidebarContext();

  const prepareAndShowMobileSidebar = () => {
    updateSidebarContent(
      <Filters hasCloseButton onClose={() => setSidebarOpen(false)} />
    );

    setSidebarOpen(true);
  };

  return (
    <>
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
                onClick={() => prepareAndShowMobileSidebar()}
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
