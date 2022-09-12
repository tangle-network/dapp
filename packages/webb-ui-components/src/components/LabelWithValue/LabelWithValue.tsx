import { Typography } from '@webb-dapp/webb-ui-components/typography';
import cx from 'classnames';
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
  ({ className, label, value, labelVariant = 'body4', valueVariant = 'body2', ...props }, ref) => {
    const mergedClsx = useMemo(() => twMerge('flex items-center space-x-1', className), [className]);
    return (
      <span {...props} className={mergedClsx} ref={ref}>
        <Label className={cx('font-bold uppercase', labelVariant)} htmlFor={label}>
          {label}
        </Label>
        <Typography component='span' variant={valueVariant}>
          {value}
        </Typography>
      </span>
    );
  }
);
