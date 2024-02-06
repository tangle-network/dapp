'use client';

import { notificationApi } from '@webb-tools/webb-ui-components';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useEffect, useMemo } from 'react';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import {
  getRoundedDownNumberWith2Decimals,
  splitTokenValueAndSymbol,
} from '../../utils';
import { InfoIconWithTooltip } from '../InfoIconWithTooltip';
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
          <SkeletonLoader className="w-[100px]" />
        ) : error ? (
          'Error'
        ) : data === null ? null : (
          <div className="flex items-center gap-2">
            <Typography
              variant="h4"
              fw="bold"
              className="text-mono-200 dark:text-mono-0"
            >
              {type !== 'Payment Destination'
                ? getRoundedDownNumberWith2Decimals(splitData?.value ?? 0)
                : data.value1 ?? '-'}
            </Typography>

            {type !== 'Payment Destination' ? (
              <Typography
                variant="label"
                fw="normal"
                className="text-mono-140 dark:text-mono-40"
              >
                {splitData?.symbol ? splitData.symbol : TANGLE_TOKEN_UNIT}
              </Typography>
            ) : (
              data.value1 && (
                <InfoIconWithTooltip
                  content={
                    data.value1 === 'Staked'
                      ? 'Current account (increase the amount at stake)'
                      : 'Current account (do not increase the amount at stake)'
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NominatorStatsItemText;
