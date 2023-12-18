import { FC, useState } from 'react';
import {
  Chip,
  Dropdown,
  DropdownBody,
  Typography,
  DropdownBasicButton,
  MenuItem,
} from '@webb-tools/webb-ui-components';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from '@webb-tools/icons';
import { ItemType } from '../utils/utils';
import { CheckCircledIcon, CircleIcon } from '@radix-ui/react-icons';
import { SearchSortByClause } from '../utils/api';

export type CardTabsProps = {
  counts: Record<ItemType, number>;
  sortByClause: SearchSortByClause;
  onTabChange: (cardType: ItemType) => void;
  onSortByClauseChange: (sortByClause: SearchSortByClause) => void;
};

export const CardTabs: FC<CardTabsProps> = (props) => {
  const [selectedTab, setSelectedTab] = useState<ItemType>(ItemType.Project);

  return (
    <div className="flex align-center">
      <div className="inline-flex gap-4">
        {Object.values(ItemType).map((cardType) => {
          const isSelected = cardType === selectedTab;

          return (
            <div
              key={cardType}
              className={twMerge(
                'flex gap-2 py-1 border-b border-transparent',
                isSelected ? 'border-mono-0' : 'cursor-pointer'
              )}
              onClick={() => {
                if (!isSelected) {
                  setSelectedTab(cardType);
                  props.onTabChange(cardType);
                }
              }}
            >
              <Typography
                variant="h5"
                fw="bold"
                className={isSelected ? 'text-mono-0' : 'dark:text-mono-100'}
              >
                {cardType}
              </Typography>

              <Chip color="grey" className="bg-mono-140 px-2">
                {props.counts[cardType]}
              </Chip>
            </div>
          );
        })}
      </div>

      <div className="flex items-center ml-auto">
        <Dropdown className="flex items-center justify-center">
          <DropdownBasicButton className="flex">
            <Typography
              variant="body1"
              fw="normal"
              className="dark:text-mono-0"
            >
              {props.sortByClause}
            </Typography>

            <ChevronDown size="lg" />
          </DropdownBasicButton>

          <DropdownBody className="mt-6 w-[280px] dark:bg-mono-180">
            <div className="px-4 py-2 hover:bg-mono-0 dark:hover:bg-mono-180">
              <Typography variant="label" fw="bold">
                Sort by
              </Typography>
            </div>

            {Object.values(SearchSortByClause).map((clause, index) => {
              const isSelected = clause === props.sortByClause;

              return (
                <MenuItem
                  className={isSelected ? 'cursor-default' : ''}
                  key={index}
                  disabled={isSelected}
                  onClick={() => props.onSortByClauseChange(clause)}
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
  );
};
