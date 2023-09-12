import { FC } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils';
import { ArrowRight } from '@webb-tools/icons';

import { getRoundedDownNumberWith2Decimals } from '../../utils';
import { PoolOverviewCardItemProps } from './types';

const PoolOverviewCardItem: FC<PoolOverviewCardItemProps> = ({
  title,
  value,
  changeRate,
  prefix = '',
  suffix = '',
  className,
}) => {
  return (
    <div className={cx('px-2', className)}>
      <div className="flex justify-center items-center gap-1">
        <div className="flex items-center gap-0.5">
          <Typography variant="h5" fw="black">
            {typeof value === 'number' && prefix}
            {getRoundedDownNumberWith2Decimals(value)}
          </Typography>
          {typeof value === 'number' && (
            <Typography
              variant="body2"
              className="text-mono-200 dark:text-mono-0"
            >
              {suffix}
            </Typography>
          )}
        </div>
        {typeof changeRate === 'number' && (
          <Typography
            variant="utility"
            tw="black"
            className={cx(
              'flex items-center',
              'uppercase text-mono-120 dark:text-mono-80 !text-[12px]',
              {
                '!text-green-70': changeRate >= 0,
                '!text-red-70': changeRate < 0,
              }
            )}
          >
            <ArrowRight
              className={cx({
                '-rotate-90 !fill-green-70': changeRate >= 0,
                'rotate-90 !fill-red-70': changeRate < 0,
              })}
            />
            {getRoundedAmountString(Math.abs(changeRate), 2)}%
          </Typography>
        )}
      </div>

      <Typography
        variant="utility"
        tw="black"
        className={cx(
          'w-full uppercase block text-center !text-[10px] md:!text-[12px]',
          'text-mono-120 dark:text-mono-80'
        )}
      >
        {title}
      </Typography>
    </div>
  );
};

export default PoolOverviewCardItem;
