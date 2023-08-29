import { FC } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils';

import { InfoIconWithTooltip } from '..';
import { MetricItemProps } from './types';
import { getRoundedDownWith2Decimals } from '../../utils';

const KeyMetricItem: FC<MetricItemProps> = ({
  title,
  value,
  prefix,
  changeRate,
  suffix,
  tooltip,
}) => {
  return (
    <div
      className={cx(
        'w-1/4 table-cell px-4 py-2 space-y-2',
        'border-x border-mono-40 dark:border-mono-160',
        'first-of-type:border-l-0 last-of-type:border-r-0'
      )}
    >
      <div className="flex items-center gap-0.5">
        <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
          {title}
        </Typography>
        {tooltip && <InfoIconWithTooltip content={tooltip} />}
      </div>
      <div className="flex items-center gap-1">
        {/* Value */}
        <span>
          <Typography
            variant="body1"
            fw="black"
            className="text-mono-140 dark:text-mono-40"
          >
            {typeof value === 'number' && (prefix ?? '')}
            {typeof value === 'number' && value < 10000
              ? Math.floor(value * 100) / 100
              : getRoundedDownWith2Decimals(value)}
            {typeof value === 'number' && (suffix ?? '')}
          </Typography>
        </span>

        {/* Change Rate */}
        {typeof changeRate === 'number' &&
          Number.isFinite(changeRate) &&
          !Number.isNaN(changeRate) && (
            <span>
              <Typography
                variant="body2"
                fw="bold"
                className={cx({
                  '!text-green-70': changeRate >= 0,
                  '!text-red-70': changeRate < 0,
                })}
              >
                ({changeRate >= 0 ? `+` : `-`}
                {getRoundedAmountString(Math.abs(changeRate), 2)}%)
              </Typography>
            </span>
          )}
      </div>
    </div>
  );
};

export default KeyMetricItem;
