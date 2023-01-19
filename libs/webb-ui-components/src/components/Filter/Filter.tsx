import { FilterIcon, Search } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { forwardRef } from 'react';

import { Button } from '../Button';
import { Dropdown, DropdownBody, DropdownButton } from '../Dropdown';
import { Input } from '../Input';
import { FilterProps } from './types';

/**
 * The `Filter` wrapper component, contains title, clear function, and the global search.
 * The children will be the specific table filter. Usually is the collapsible filter
 */
export const Filter = forwardRef<HTMLDivElement, FilterProps>(
  (
    {
      children,
      clearAllFilters,
      onSearchChange,
      searchPlaceholder = 'Search Authority, or Key',
      searchText,
      ...props
    },
    ref
  ) => {
    return (
      <Dropdown {...props} ref={ref}>
        <DropdownButton label="Filters" icon={<FilterIcon />} size="sm" />

        <DropdownBody className="py-2 min-w-[300px]" size="sm">
          {/** Title */}
          <div className="flex items-center justify-between px-4 py-2">
            <Typography variant="h5" fw="bold">
              Filters
            </Typography>
            <Button
              variant="link"
              size="sm"
              className="uppercase"
              onClick={clearAllFilters}
            >
              Clear all
            </Button>
          </div>

          {/** Search input */}
          <div className="p-2">
            <Input
              id="search keygen"
              placeholder={searchPlaceholder}
              rightIcon={<Search />}
              value={searchText}
              onChange={onSearchChange}
              debounceTime={300}
            />
          </div>

          {/** Filter body */}

          {children}
        </DropdownBody>
      </Dropdown>
    );
  }
);
