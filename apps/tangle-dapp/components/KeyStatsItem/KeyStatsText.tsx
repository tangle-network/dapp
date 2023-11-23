'use client';

import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

import getRoundedDownNumberWith2Decimals from '../../utils/getRoundedDownNumberWith2Decimals';
import dataHooks from './dataHooks';
import type { KeyStatsItemProps } from './types';

type Props = Pick<KeyStatsItemProps, 'title' | 'prefix' | 'suffix'>;

const KeyStatsItemText = ({ title, prefix, suffix }: Props) => {
  const { isLoading, error, data } = dataHooks[title]();

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
      <div className="flex items-center gap-0.5">
        {isLoading ? (
          <SkeletonLoader className="w-[100px]" />
        ) : error ? (
          'Error'
        ) : data === null ? null : (
          <>
            <Typography
              variant="h4"
              fw="bold"
              className="text-mono-140 dark:text-mono-40"
            >
              {typeof data.value1 === 'number' && (prefix ?? '')}
              {data.value1 !== null
                ? getRoundedDownNumberWith2Decimals(data.value1)
                : ''}
              {data.value2 && data.value2 !== null && (
                <> / {getRoundedDownNumberWith2Decimals(data.value2)}</>
              )}
            </Typography>

            {typeof data.value1 === 'number' && suffix && (
              <Typography
                variant="h4"
                fw="bold"
                className="text-mono-140 dark:text-mono-40"
              >
                {suffix}
              </Typography>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KeyStatsItemText;
