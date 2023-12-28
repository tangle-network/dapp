'use client';

import { Button } from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { FC } from 'react';
import useTailwindBreakpoint, {
  TailwindBreakpoint,
} from '../hooks/useTailwindBreakpoint';
import { PageUrl } from '../utils/utils';
import { SearchInput } from './SearchInput';

export const HomepageSearchControls: FC<Record<string, never>> = () => {
  const breakpoint = useTailwindBreakpoint();

  return (
    <div className="shadow-xl py-4 px-6 dark:bg-mono-170 rounded-xl flex flex-col sm:flex-row gap-2">
      <SearchInput isHomepageVariant id="homepage search" />

      <Link href={PageUrl.SubmitProject} className="flex-grow sm:flex-grow-0">
        <Button isFullWidth={breakpoint <= TailwindBreakpoint.SM}>
          Upload Project
        </Button>
      </Link>
    </div>
  );
};
