import { Typography } from '../../typography';
import React, { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { TitleWithInfo } from '../TitleWithInfo';
import { StatsProps } from './types';

export const Stats = forwardRef<HTMLDivElement, StatsProps>(({ className, items, ...props }, ref) => {
  const mergedClsx = useMemo(() => twMerge('flex items-center pb-12 justify-evenly', className), [className]);

  return (
    <div {...props} className={mergedClsx} ref={ref}>
      {items.map((item, idx) => (
        <div key={`${item.titleProps.title}-${idx}`} className='flex flex-col items-center space-y-2'>
          <TitleWithInfo {...item.titleProps} />

          <Typography variant='h4' fw='bold'>
            {item.value.toString()}
          </Typography>
        </div>
      ))}
    </div>
  );
});
