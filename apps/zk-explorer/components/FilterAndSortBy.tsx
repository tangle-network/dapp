import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CheckCircledIcon, CircleIcon } from '@radix-ui/react-icons';
import { ChevronDown, FilterIcon2 } from '@webb-tools/icons';
import {
  Button,
  Dropdown,
  DropdownBody,
  MenuItem,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';
import Filters from '../containers/Filters';
import { FilterConstraints } from '../containers/Filters/types';
import { useSidebarContext } from '../context/SidebarContext';
import useTailwindBreakpoint, {
  TailwindBreakpoint,
} from '../hooks/useTailwindBreakpoint';
import { SearchSortByClause } from '../server/circuits';

export type FilterAndSortByProps = {
  sortByClause: SearchSortByClause;
  onSortByClauseChange: (sortByClause: SearchSortByClause) => void;
  onConstraintsChange: (constraints: FilterConstraints) => void;
};

const FilterAndSortBy: FC<FilterAndSortByProps> = ({
  onConstraintsChange,
  sortByClause,
  onSortByClauseChange,
}) => {
  const breakpoint = useTailwindBreakpoint();
  const { setSidebarOpen, updateSidebarContent } = useSidebarContext();

  const prepareAndShowMobileSidebar = useCallback(() => {
    updateSidebarContent(
      <Filters
        onConstraintsChange={onConstraintsChange}
        hasCloseButton
        onClose={() => setSidebarOpen(false)}
      />
    );

    setSidebarOpen(true);
  }, [onConstraintsChange, setSidebarOpen, updateSidebarContent]);

  return (
    <div className="flex items-center md:ml-auto w-full">
      <Dropdown className="flex justify-end w-full">
        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenuPrimitive.Trigger asChild className="w-full sm:w-auto">
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
          </DropdownMenuPrimitive.Trigger>

          <Button
            size="sm"
            variant="utility"
            className="sm:hidden w-full"
            isFullWidth
            onClick={prepareAndShowMobileSidebar}
            rightIcon={<FilterIcon2 className="dark:fill-blue-50" size="lg" />}
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
  );
};

export default FilterAndSortBy;
