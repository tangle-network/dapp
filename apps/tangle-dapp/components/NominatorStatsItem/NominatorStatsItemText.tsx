'use client';

import { notificationApi } from '@webb-tools/webb-ui-components';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useEffect } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import { formatTokenBalance } from '../../utils/polkadot';
import dataHooks from './dataHooks';
import type { NominatorStatsItemProps } from './types';

type Props = Pick<NominatorStatsItemProps, 'address' | 'type'>;

const NominatorStatsItemText = ({ address, type }: Props) => {
  const { nativeTokenSymbol } = useNetworkStore();
  const { isLoading, error, data } = dataHooks[type](address);

  useEffect(() => {
    if (error) {
      notificationApi({
        variant: 'error',
        message: error.message,
        key: error.message,
      });
    }
  }, [error]);

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
      <div className="flex items-center gap-0.5">
        {isLoading ? (
          <SkeletonLoader className="w-[100px]" size="lg" />
        ) : error ? (
          'Error'
        ) : data === null ? null : (
          <div className="flex items-center gap-2">
            <Typography
              variant="h4"
              fw="bold"
              className="text-mono-140 dark:text-mono-40"
            >
              {data.value1
                ? formatTokenBalance(data.value1, nativeTokenSymbol)
                : '-'}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default NominatorStatsItemText;
