import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { FC, Suspense } from 'react';
import { twMerge } from 'tailwind-merge';

import { InfoIconWithTooltip } from '..';
import KeyMetricItemValueClient from './KeyMetricItemValueClient';
import { MetricItemProps } from './types';

export const KeyMetricItem: FC<MetricItemProps> = ({
  title,
  tooltip,
  className,
  ...restProps
}) => {
  return (
    <div className={twMerge('px-2 py-2 space-y-2 md:px-4', className)}>
      <div className="flex items-center gap-0.5">
        <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
          {title}
        </Typography>
        {tooltip && <InfoIconWithTooltip content={tooltip} />}
      </div>

      <Suspense fallback={<SkeletonLoader size="lg" />}>
        <KeyMetricItemValue {...restProps} title={title} />
      </Suspense>
    </div>
  );
};

const KeyMetricItemValue = async (props: Omit<MetricItemProps, 'tooltip'>) => {
  const { dataFetcher, prefix, suffix, title } = props;

  const { value1, value2 } = await dataFetcher();

  return (
    <KeyMetricItemValueClient
      prefix={prefix}
      suffix={suffix}
      value1={value1}
      value2={value2}
      title={title}
    />
  );
};
