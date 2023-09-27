import { FC, Suspense } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils';

import { InfoIconWithTooltip } from '..';
import { getRoundedDownNumberWith2Decimals } from '../../utils';
import { MetricItemProps } from './types';

const KeyMetricItem: FC<MetricItemProps> = ({
  title,
  tooltip,
  ...restProps
}) => {
  return (
    <div className="px-4 py-2 space-y-2">
      <div className="flex items-center gap-0.5">
        <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
          {title}
        </Typography>
        {tooltip && <InfoIconWithTooltip content={tooltip} />}
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="w-full h-6 rounded-md bg-slate-200 dark:bg-mono-160" />
          </div>
        }
      >
        <KeyMetricItemValue {...restProps} />
      </Suspense>
    </div>
  );
};

export default KeyMetricItem;

const KeyMetricItemValue = async (
  props: Omit<MetricItemProps, 'title' | 'tooltip'>
) => {
  const { dataFetcher, prefix, suffix } = props;

  const { value, changeRate } = await dataFetcher();

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
      {/* Value */}
      <div className="flex items-center gap-0.5">
        <Typography
          variant="body1"
          fw="black"
          className="text-mono-140 dark:text-mono-40"
        >
          {typeof value === 'number' && (prefix ?? '')}
          {getRoundedDownNumberWith2Decimals(value)}
        </Typography>
        {typeof value === 'number' && suffix && (
          <Typography
            variant="body2"
            fw="bold"
            className="text-mono-140 dark:text-mono-40"
          >
            {suffix}
          </Typography>
        )}
      </div>

      {/* Change Rate */}
      {typeof changeRate === 'number' &&
        Number.isFinite(changeRate) &&
        !Number.isNaN(changeRate) && (
          <Typography
            variant="body4"
            fw="bold"
            className={cx({
              '!text-green-70': changeRate >= 0,
              '!text-red-70': changeRate < 0,
            })}
          >
            ({changeRate >= 0 ? `+` : `-`}
            {getRoundedAmountString(Math.abs(changeRate), 2)}%)
          </Typography>
        )}
    </div>
  );
};
