import { Filter as FilterIcon, Search } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
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
  ({ children, clearAllFilters, onSearchChange, searchText, ...props }, ref) => {
    return (
      <Dropdown {...props} ref={ref}>
        <DropdownButton label='Filters' icon={<FilterIcon />} size='sm' />

        <DropdownBody className='py-2 min-w-[300px]'>
          {/** Title */}
          <div className='flex items-center justify-between px-4 py-2'>
            <Typography variant='h5' fw='bold'>
              Filters
            </Typography>
            <Button varirant='link' size='sm' className='uppercase' onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>

          {/** Search input */}
          <div className='p-2'>
            <Input
              id='search keygen'
              placeholder='Search Authority, or Key'
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
