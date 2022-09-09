import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Label } from '../Label';
import { LabelWithValueProps } from './types';

/**
 * The `LabelWithValue` component
 *
 * Reuseable component contains a small label with value after it
 *
 * ```jsx
 *  <LabelWithValue label='session: ' value={'123'} />
 * ```
 */
export const LabelWithValue = forwardRef<HTMLSpanElement, LabelWithValueProps>(
  ({ className, label, value, ...props }, ref) => {
    const mergedClsx = useMemo(() => twMerge('flex items-center space-x-1', className), [className]);
    return (
      <span {...props} className={mergedClsx} ref={ref}>
        <Label className='font-bold uppercase body4' htmlFor={label}>
          {label}
        </Label>
        <Typography component='span' variant='body2'>
          {value}
        </Typography>
      </span>
    );
  }
);
