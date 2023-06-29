import { FC } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils';

interface MetricItemProps {
  title: string;
  value?: number;
  changeRate?: number;
  isCurrency?: boolean;
}

export const MetricItem: FC<MetricItemProps> = ({
  title,
  value,
  isCurrency,
  changeRate,
}) => {
  return (
    <div
      className={cx(
        'table-cell px-4 py-2 space-y-2 border-x border-mono-40',
        'first-of-type:border-l-0 last-of-type:border-r-0'
      )}
    >
      <Typography variant="body1" className="text-mono-140">
        {title}
      </Typography>
      <div className="flex items-center gap-1">
        {/* Value */}
        <span>
          <Typography
            variant="body1"
            fw="black"
            className="text-mono-140 uppercase"
          >
            {isCurrency && value && '$'}
            {typeof value === 'number' && value < 10000
              ? value
              : getRoundedAmountString(value, 2, Math.floor, true)}
          </Typography>
        </span>

        {/* Change Rate */}
        {changeRate && (
          <span>
            <Typography
              variant="body2"
              fw="bold"
              className={cx({
                'text-green-70': changeRate >= 0,
                'text-red-70': changeRate < 0,
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
