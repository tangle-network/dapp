import { FC } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils';

import { MetricItemProps } from './types';

const KeyMetricItem: FC<MetricItemProps> = ({
  title,
  value,
  prefix,
  changeRate,
}) => {
  return (
    <div
      className={cx(
        'table-cell px-4 py-2 space-y-2 w-1/4',
        'border-x border-mono-40 dark:border-mono-160',
        'first-of-type:border-l-0 last-of-type:border-r-0'
      )}
    >
      <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
        {title}
      </Typography>
      <div className="flex items-center gap-1">
        {/* Value */}
        <span>
          <Typography
            variant="body1"
            fw="black"
            className="uppercase text-mono-140 dark:text-mono-40"
          >
            {value && (prefix ?? '')}
            {typeof value === 'number' && value < 10000
              ? value
              : getRoundedAmountString(value, 2, {
                  roundingFunction: Math.floor,
                  totalLength: 0,
                })}
          </Typography>
        </span>

        {/* Change Rate */}
        {changeRate && (
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
