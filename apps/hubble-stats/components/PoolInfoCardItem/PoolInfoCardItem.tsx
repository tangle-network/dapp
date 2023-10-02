import { type FC, Suspense } from 'react';
import cx from 'classnames';
import { Typography, SkeletonLoader } from '@webb-tools/webb-ui-components';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils';
import { ArrowRight } from '@webb-tools/icons';

import { getRoundedDownNumberWith2Decimals } from '../../utils';
import { PoolInfoCardItemProps } from './types';

const PoolInfoCardItem: FC<PoolInfoCardItemProps> = ({
  title,
  prefix = '',
  suffix = '',
  className,
  dataFetcher,
}) => {
  return (
    <div className={cx('px-2', className)}>
      <Suspense fallback={<SuspenseFallback title={title} />}>
        <PoolInfoCardItemValue
          title={title}
          prefix={prefix}
          suffix={suffix}
          dataFetcher={dataFetcher}
        />
      </Suspense>
    </div>
  );
};

export default PoolInfoCardItem;

async function PoolInfoCardItemValue({
  dataFetcher,
  title,
  prefix,
  suffix,
}: Omit<PoolInfoCardItemProps, 'className'>) {
  const { value, changeRate } = await dataFetcher();

  return (
    <>
      <div className="flex items-center justify-center gap-0.5">
        <Typography variant="h5" fw="black">
          {typeof value === 'number' && prefix}
          {getRoundedDownNumberWith2Decimals(value)}
        </Typography>
        {typeof value === 'number' && suffix && (
          <Typography
            variant="body2"
            className="text-mono-200 dark:text-mono-0"
          >
            {suffix}
          </Typography>
        )}
      </div>

      <div className="flex justify-center items-center gap-1">
        <Typography
          variant="utility"
          tw="black"
          className={cx(
            'uppercase block text-center !text-[10px] md:!text-[12px]',
            'text-mono-120 dark:text-mono-80'
          )}
        >
          {title}
        </Typography>
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
    </>
  );
}

const SuspenseFallback: FC<Pick<PoolInfoCardItemProps, 'title'>> = ({
  title,
}) => {
  return (
    <>
      <div className="flex items-center justify-center gap-0.5 mb-1">
        <SkeletonLoader size="lg" className="w-[100px]" />
      </div>

      <div className="flex justify-center items-center gap-1">
        <Typography
          variant="utility"
          tw="black"
          className={cx(
            'uppercase block text-center !text-[10px] md:!text-[12px]',
            'text-mono-120 dark:text-mono-80'
          )}
        >
          {title}
        </Typography>
      </div>
    </>
  );
};
