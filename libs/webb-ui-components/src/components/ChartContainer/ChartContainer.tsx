import { useMemo, forwardRef } from 'react';
import { ChartContainerProps } from './types';
import { Chip } from '../Chip';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { getRoundedAmountString } from '../../utils';

/**
 * Container for charts (e.g. TVL, Volume, etc.) that displays chart heading, value, chart (should be passed as a child) and along with optional chart filters (e.g days, tokens and chains).
 *
 * Props for this component:
 *
 * - heading - Heading of the chart (Optional) - E.g. TVL, Volume 24H, etc.
 * - currentValue - Latest value - E.g. $1.2m, $2.3k, etc.
 * - value - Value to be displayed in currentValue's place when hovering over the chart (Tooltip response)
 * - date - Date corresponding to the value displayed beside value when hovering over the chart (Tooltip response)
 * - filterType - Type of filter to be displayed (Optional) - E.g. days (days, week, month), tokens and chains
 * - daysFilterType - Type of days filter to be displayed (Optional) - E.g. day, week, month
 * - setDaysFilterType - Function to set the days filter type (Optional)
 * - className - Optional className for the container
 */
export const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(
  (
    {
      heading,
      currentValue,
      value,
      valuePrefix = '',
      valueSuffix = '',
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
        'p-6 flex flex-col justify-between gap-4 border-2 rounded-lg dark:border-mono-160 border-mono-0',
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
                {`${valuePrefix}
                ${getRoundedAmountString(value ?? currentValue, 2, {
                  roundingFunction: Math.floor,
                  totalLength: 0,
                })}${valueSuffix}`}
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
