'use client';

import { Search } from '@webb-tools/icons';
import { Button, Input } from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';
import useTailwindBreakpoint, {
  TailwindBreakpoint,
} from '../hooks/useTailwindBreakpoint';
import Link from 'next/link';
import { PageUrl } from '../utils/utils';

export const HomepageSearchControls: FC<Record<string, never>> = () => {
  const SEARCH_QUERY_DEBOUNCE_DELAY = 1500;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const breakpoint = useTailwindBreakpoint();

  const searchQueryPlaceholder =
    breakpoint >= TailwindBreakpoint.SM
      ? 'Search projects and circuits for specific keywords...'
      : 'Search projects and circuits...';

  return (
    <div className="shadow-xl py-4 px-6 dark:bg-mono-170 rounded-xl flex flex-col sm:flex-row gap-2">
      <Input
        id="keyword search"
        rightIcon={<Search size="lg" className="mr-4" />}
        className="flex-grow"
        inputClassName="rounded-[50px] pr-12"
        placeholder={searchQueryPlaceholder}
        value={searchQuery}
        debounceTime={SEARCH_QUERY_DEBOUNCE_DELAY}
        onChange={(value) => setSearchQuery(value)}
      />

      <Link href={PageUrl.SubmitProject} className="flex-grow sm:flex-grow-0">
        <Button isFullWidth={breakpoint <= TailwindBreakpoint.SM}>
          Upload Project
        </Button>
      </Link>
    </div>
  );
};
