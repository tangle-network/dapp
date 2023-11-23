'use client';

import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useMemo } from 'react';

import {
  getRoundedDownNumberWith2Decimals,
  splitTokenValueAndSymbol,
} from '../../utils';
import dataHooks from './dataHooks';
import type { NominatorStatsItemProps } from './types';

type Props = Pick<NominatorStatsItemProps, 'address' | 'type'>;

const NominatorStatsItemText = ({ address, type }: Props) => {
  const { isLoading, error, data } = dataHooks[type](address);

  const splitData = useMemo(() => {
    if (!data) return null;

    const { value: value_, symbol } = splitTokenValueAndSymbol(
      String(data.value1)
    );

    return {
      value: value_,
      symbol,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
      <div className="flex items-center gap-0.5">
        {isLoading ? (
          <SkeletonLoader className="w-[100px]" />
        ) : error ? (
          'Error'
        ) : data === null ? null : (
          <div className="flex gap-2 items-center">
            <Typography
              variant="h4"
              fw="bold"
              className="text-mono-200 dark:text-mono-0"
            >
              {getRoundedDownNumberWith2Decimals(splitData?.value ?? 0)}
            </Typography>

            <Typography
              variant="label"
              fw="medium"
              className="text-mono-140 dark:text-mono-40"
            >
              {splitData?.symbol ? splitData.symbol : 'tTNT'}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default NominatorStatsItemText;
