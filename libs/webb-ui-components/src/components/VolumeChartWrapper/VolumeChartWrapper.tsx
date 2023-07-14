import { useMemo, forwardRef } from 'react';
import { VolumeChartWrapperProps } from './types';
import { VolumeChartsContainerInfo } from '../VolumeChartsContainerInfo';
import { Chip } from '../Chip';
import { twMerge } from 'tailwind-merge';

export const VolumeChartWrapper = forwardRef<
  HTMLDivElement,
  VolumeChartWrapperProps
>(
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
          <VolumeChartsContainerInfo
            heading={heading}
            value={`$${value ?? currentValue}m`}
            date={date}
          />

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
