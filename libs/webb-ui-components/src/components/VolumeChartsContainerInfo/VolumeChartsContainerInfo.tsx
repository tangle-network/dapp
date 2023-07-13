import { forwardRef } from 'react';
import { Typography } from '../../typography/Typography';
import { VolumeChartsContainerInfoProps } from './types';

export const VolumeChartsContainerInfo = forwardRef<
  HTMLDivElement,
  VolumeChartsContainerInfoProps
>(({ heading, value, date, ...props }, ref) => {
  return (
    <div className="flex flex-col justify-between gap-4" {...props} ref={ref}>
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
          {value}
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
  );
});
