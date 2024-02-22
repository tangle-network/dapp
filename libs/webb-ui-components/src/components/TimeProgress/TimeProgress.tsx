import { calculateDateProgress, formatDateToUtc } from '../../utils';
import React, { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { LabelWithValue } from '../LabelWithValue';
import { Progress } from '../Progress';
import { TimeProgressProps } from './types';

/**
 * The `TimeProgress` component displays the `Progress` bar with the `startTime` and `endTime` dynamically
 *
 * @example
 *
 * ```jsx
 *  <TimeProgress startTime="Sep 09 2022 (15:08:51 PM UTC)" endTime="Sep 09 2022 (15:08:51 PM UTC)" />
 * ```
 */
export const TimeProgress = React.forwardRef<HTMLDivElement, TimeProgressProps>(
  ({ endTime, now, startTime, labelClassName, ...props }, ref) => {
    const [dateProgress, setDateProgress] = useState<number | null>(
      calculateDateProgress(startTime, endTime, now)
    );
    const timerRef = useRef<NodeJS.Timeout>();

    // Re-calculate progress each 1s
    useEffect(() => {
      const timer = setInterval(() => {
        const progress = calculateDateProgress(startTime, endTime, now);
        setDateProgress(progress);
      }, 1000);

      timerRef.current = timer;

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [dateProgress, endTime, startTime, now]);

    return (
      <div {...props} ref={ref}>
        <div className="flex gap-4 md:items-center md:justify-between">
          <LabelWithValue
            label="Start:"
            value={formatDateToUtc(startTime)}
            className={twMerge(
              'flex-col md:flex-row items-start md:items-center md:gap-0.5',
              labelClassName
            )}
          />
          <LabelWithValue
            label="End:"
            value={formatDateToUtc(endTime)}
            className={twMerge(
              'flex-col md:flex-row items-end md:items-center md:gap-0.5 [&>span]:text-end',
              labelClassName
            )}
          />
        </div>
        <Progress value={dateProgress} className="w-full mt-3" />
      </div>
    );
  }
);
