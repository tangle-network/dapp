import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import type { FC } from 'react';
import { Suspense } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  getRoundedDownNumberWith2Decimals,
  splitTokenValueAndSymbol,
} from '../../utils';
import { InfoIconWithTooltip } from '..';
import { StatsMetricItemProps } from './types';

export const StatsMetricItem: FC<StatsMetricItemProps> = ({
  title,
  tooltip,
  className,
  ...restProps
}) => {
  return (
    <div className={twMerge('flex flex-col gap-4', className)}>
      <Suspense fallback={<SkeletonLoader size="lg" />}>
        <StatsMetricItemValue {...restProps} />
      </Suspense>

      <div className="flex items-center gap-0.5">
        <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
          {title}
        </Typography>
        {tooltip && <InfoIconWithTooltip content={tooltip} />}
      </div>
    </div>
  );
};

/** @internal */
const StatsMetricItemValue = async (
  props: Omit<StatsMetricItemProps, 'tooltip' | 'title'>
) => {
  const { dataFetcher, address } = props;

  const value = await dataFetcher(address);

  const { value: value_, symbol } = splitTokenValueAndSymbol(String(value));

  return (
    <div className="flex gap-2 items-center">
      <Typography
        variant="h4"
        fw="bold"
        className="text-mono-200 dark:text-mono-0"
      >
        {getRoundedDownNumberWith2Decimals(value_)}
      </Typography>

      <Typography
        variant="label"
        fw="medium"
        className="text-mono-140 dark:text-mono-40"
      >
        {symbol ? symbol : 'tTNT'}
      </Typography>
    </div>
  );
};
