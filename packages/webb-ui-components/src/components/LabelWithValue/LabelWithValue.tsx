import { Typography } from '@webb-dapp/webb-ui-components/typography';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Label } from '../Label';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
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
  (
    { className, isHiddenLabel, label, labelVariant = 'body4', value, valueTooltip, valueVariant = 'body2', ...props },
    ref
  ) => {
    const mergedClsx = useMemo(() => twMerge('flex items-center space-x-1', className), [className]);
    return (
      <span {...props} className={mergedClsx} ref={ref}>
        <Label
          hidden={isHiddenLabel}
          className={cx('font-bold uppercase body4', isHiddenLabel && 'hidden')}
          htmlFor={label}
        >
          {label}
        </Label>
        {!valueTooltip &&
          (typeof value === 'string' || typeof value === 'number' ? (
            <Typography component='span' variant={valueVariant}>
              {value}
            </Typography>
          ) : (
            value
          ))}

        {valueTooltip && (
          <Tooltip>
            <TooltipTrigger>{value}</TooltipTrigger>
            <TooltipBody>{valueTooltip}</TooltipBody>
          </Tooltip>
        )}
      </span>
    );
  }
);
