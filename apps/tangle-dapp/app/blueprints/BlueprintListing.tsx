'use client';

import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Input } from '@webb-tools/webb-ui-components/components/Input';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const BlueprintListing: FC = () => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div
        className={twMerge(
          'rounded-xl py-4 px-6 bg-mono-0 dark:bg-mono-180',
          'flex items-center gap-2',
        )}
      >
        <Input
          id="search-blueprints"
          placeholder="Search"
          value={searchValue}
          onChange={(val) => setSearchValue(val)}
          isControlled
          className="flex-1 rounded-full overflow-hidden"
          inputClassName="border-0 bg-mono-20 dark:bg-mono-200"
        />
        <Button variant="secondary">Search</Button>
      </div>

      {/* Category */}

      {/* Blueprint list */}

      {/* Pagination */}
    </div>
  );
};

export default BlueprintListing;
