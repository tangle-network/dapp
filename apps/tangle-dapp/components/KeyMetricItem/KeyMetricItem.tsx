import { FC, Suspense } from 'react';
import { Typography, SkeletonLoader } from '@webb-tools/webb-ui-components';
import { InfoIconWithTooltip } from '..';
import { getRoundedDownNumberWith2Decimals } from '../../utils';
import { MetricItemProps } from './types';

export const KeyMetricItem: FC<MetricItemProps> = ({
  title,
  tooltip,
  ...restProps
}) => {
  return (
    <div className="px-2 py-2 space-y-2 md:px-4">
      <div className="flex items-center gap-0.5">
        <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
          {title}
        </Typography>
        {tooltip && <InfoIconWithTooltip content={tooltip} />}
      </div>

      <Suspense fallback={<SkeletonLoader size="lg" />}>
        <KeyMetricItemValue {...restProps} />
      </Suspense>
    </div>
  );
};

const KeyMetricItemValue = async (
  props: Omit<MetricItemProps, 'title' | 'tooltip'>
) => {
  const { dataFetcher, prefix, suffix } = props;

  const { value1, value2 } = await dataFetcher();

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
      <div className="flex items-center gap-0.5">
        <Typography
          variant="h4"
          fw="bold"
          className="text-mono-140 dark:text-mono-40"
        >
          {typeof value1 === 'number' && (prefix ?? '')}
          {getRoundedDownNumberWith2Decimals(value1)}
          {value2 && <> / {getRoundedDownNumberWith2Decimals(value2)}</>}
        </Typography>

        {typeof value1 === 'number' && suffix && (
          <Typography
            variant="h4"
            fw="bold"
            className="text-mono-140 dark:text-mono-40"
          >
            {suffix}
          </Typography>
        )}
      </div>
    </div>
  );
};
