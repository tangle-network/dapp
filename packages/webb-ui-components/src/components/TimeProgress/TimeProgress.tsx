import { calculateDateProgress, formatDateToUtc } from '@webb-dapp/webb-ui-components/utils';
import React, { useEffect, useRef, useState } from 'react';

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
  ({ endTime, startTime, ...props }, ref) => {
    const [dateProgress, setDateProgress] = useState<number | null>(calculateDateProgress(startTime, endTime));
    const timerRef = useRef<NodeJS.Timeout>();

    // Re-calculate progress each 1s
    useEffect(() => {
      const timer = setInterval(() => {
        const progress = calculateDateProgress(startTime, endTime);
        setDateProgress(progress);
      }, 1000);

      timerRef.current = timer;

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [dateProgress, endTime, startTime]);

    return (
      <div {...props} ref={ref}>
        <Progress value={dateProgress} className='w-full' />
        <div className='flex items-center justify-between mt-3'>
          <LabelWithValue label='start:' value={formatDateToUtc(startTime)} />
          <LabelWithValue label='end:' value={endTime === 'TBD' ? 'TBD' : formatDateToUtc(endTime)} />
        </div>
      </div>
    );
  }
);
