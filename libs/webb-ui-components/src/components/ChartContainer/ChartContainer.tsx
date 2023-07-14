import { useMemo, forwardRef } from 'react';
import { ChartContainerProps } from './types';
import { Chip } from '../Chip';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';

export const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(
  (
    {
      heading,
      currentValue,
      value,
      date,
      filterType,
      daysFilterType,
      setDaysFilterType,
      className: wrapperClassName,
      children,
      ...props
    },
    ref
  ) => {
    const className = useMemo(() => {
      return twMerge(
        'bg-mono-0 dark:bg-mono-160 p-6 flex flex-col justify-between gap-4 border-2 rounded-lg  border-mono-0 dark:border-mono-160',
        wrapperClassName
      );
    }, [wrapperClassName]);

    return (
      <div className={className} ref={ref} {...props}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col justify-between gap-4">
            {heading && (
              <Typography
                variant="h5"
                fw="bold"
                className="!text-[20px] !leading-[30px] text-mono-200 dark:text-mono-0"
              >
                {heading}
              </Typography>
            )}

            <div className="flex flex-row items-center gap-2">
              <Typography
                variant="h4"
                fw="bold"
                className="!text-[24px] !leading-[36px] text-mono-200 dark:text-mono-0"
              >
                {`$${value ?? currentValue}m`}
              </Typography>

              <Typography
                variant="body4"
                fw="bold"
                className="!text-[12px] !leading-[15px] text-mono-120"
              >
                {date &&
                  new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {filterType === 'days' && daysFilterType && setDaysFilterType ? (
              <>
                <Chip
                  color="blue"
                  className="cursor-pointer"
                  isSelected={daysFilterType === 'day'}
                  onClick={() => setDaysFilterType('day')}
                >
                  D
                </Chip>
                <Chip
                  color="blue"
                  className="cursor-pointer"
                  isSelected={daysFilterType === 'week'}
                  onClick={() => setDaysFilterType('week')}
                >
                  W
                </Chip>
                <Chip
                  color="blue"
                  className="cursor-pointer"
                  isSelected={daysFilterType === 'month'}
                  onClick={() => setDaysFilterType('month')}
                >
                  M
                </Chip>
              </>
            ) : filterType === 'tokensAndChains' ? (
              <>{/* Token and Chain selectors */}</>
            ) : null}
          </div>
        </div>

        <div>{children}</div>
      </div>
    );
  }
);
