'use client';

import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

import type { MetricReturnType } from '../../types';
import getRoundedDownNumberWith2Decimals from '../../utils/getRoundedDownNumberWith2Decimals';
import dataHooks, { defaultHook } from './dataHooks';
import type { MetricItemProps } from './types';

function KeyMetricItemValueClient(
  props: Pick<MetricItemProps, 'prefix' | 'suffix' | 'title'> & MetricReturnType
) {
  const { title, prefix, suffix, value1: value1_, value2: value2_ } = props;
  const dataHook = dataHooks[title] ?? defaultHook;
  const { value1, value2 } = dataHook({ value1: value1_, value2: value2_ });

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
}

export default KeyMetricItemValueClient;
