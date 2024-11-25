import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { TANGLE_DOCS_RESTAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../../components/GlassCard';
import { CONTENT } from './shared';

const LoadingPage: FC = () => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 md:flex-row">
        <GlassCard
          className={twMerge(
            'justify-between min-h-60',
            '[background:linear-gradient(79deg,_#b6b8dd_8.85%,_#d9ddf2_55.91%,_#dbbdcd_127.36%),_#fff]',
            'dark:[background:linear-gradient(79deg,_rgba(30,_32,_65,_0.8)_8.85%,_rgba(38,_52,_116,_0.8)_55.91%,_rgba(113,_61,_89,_0.8)_127.36%)]',
          )}
        >
          <Typography
            variant="body1"
            className="text-mono-200 dark:text-mono-0 max-w-[510px] pb-3"
          >
            {CONTENT.OVERVIEW}
          </Typography>

          <div className="flex justify-end gap-6 pt-3 border-t border-mono-0 dark:border-mono-140">
            <SkeletonLoader className="w-full h-11" />

            <SkeletonLoader className="w-full h-11" />
          </div>
        </GlassCard>

        <GlassCard
          className={twMerge('min-h-60, md:max-w-[442px] justify-between')}
        >
          <div>
            <Typography
              variant="body1"
              fw="bold"
              className="text-mono-200 dark:text-mono-0 mb-2.5"
            >
              How it works
            </Typography>

            <Typography variant="body1">{CONTENT.HOW_IT_WORKS}</Typography>
          </div>

          <Button
            href={TANGLE_DOCS_RESTAKING_URL}
            target="_blank"
            variant="link"
            size="sm"
            className="inline-block ml-auto"
          >
            Read more
          </Button>
        </GlassCard>
      </div>

      <SkeletonLoader className="w-full h-64" />
    </div>
  );
};

export default LoadingPage;
