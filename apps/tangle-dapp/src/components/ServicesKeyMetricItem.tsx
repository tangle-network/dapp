import { ArrowRight } from '@tangle-network/icons';
import { IconBase } from '@tangle-network/icons/types';
import { SkeletonLoader, Typography } from '@tangle-network/ui-components';
import { getRoundedAmountString } from '@tangle-network/ui-components/utils';
import { FC, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  title: string;
  Icon: (props: IconBase) => ReactElement;
  isLoading: boolean;
  isError?: boolean;
  value?: number | null;
  changeRate?: number | null;
  className?: string;
};

const ServicesKeyMetricItem: FC<Props> = ({
  title,
  Icon,
  isLoading,
  isError,
  value,
  changeRate,
  className,
}) => {
  return (
    <div
      className={twMerge(
        'overflow-hidden p-6 flex flex-col gap-2 justify-between',
        className,
      )}
    >
      <div className="flex-1 flex items-center justify-between gap-4">
        <Typography variant="body1" className="lg:whitespace-nowrap">
          {title}
        </Typography>

        {/* Icon */}
        <div className="lg:hidden">
          <Icon className="w-6 h-6 !fill-mono-140 dark:!fill-mono-0" />
        </div>
        <Icon className="w-6 h-6 !fill-mono-140 dark:!fill-mono-0 hidden lg:block" />
      </div>
      {isLoading ? (
        <SkeletonLoader size="lg" />
      ) : (
        <div className="flex items-center justify-between gap-4">
          {/* Value */}
          <Typography variant="h4" fw="bold">
            {typeof value === 'number' && !isError ? value : 'Error'}
          </Typography>

          {/* Change Rate */}
          {typeof changeRate === 'number' &&
            Number.isFinite(changeRate) &&
            !Number.isNaN(changeRate) && (
              <div className="flex gap-0.5 justify-center">
                <Typography
                  variant="body4"
                  fw="bold"
                  className={twMerge(
                    changeRate >= 0 ? '!text-green-70' : '!text-red-70',
                  )}
                >
                  {changeRate >= 0 ? `+` : `-`}
                  {getRoundedAmountString(Math.abs(changeRate), 2)}%
                </Typography>
                <ArrowRight
                  className={twMerge(
                    changeRate >= 0
                      ? '!fill-green-70 rotate-[-90deg]'
                      : '!fill-red-70 rotate-90',
                  )}
                />
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ServicesKeyMetricItem;
