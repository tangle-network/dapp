import { Typography } from '../../typography';
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
    {
      className,
      isHiddenLabel,
      label,
      labelVariant = 'utility',
      value,
      valueTooltip,
      valueVariant = 'body1',
      ...props
    },
    ref
  ) => {
    const mergedClsx = useMemo(
      () => twMerge('flex items-center space-x-1', className),
      [className]
    );
    return (
      <span {...props} className={mergedClsx} ref={ref}>
        {label ? (
          <Label
            hidden={isHiddenLabel}
            className={cx(
              'text-mono-140 dark:text-mono-80 font-semibold',
              labelVariant,
              isHiddenLabel && 'hidden'
            )}
            htmlFor={label}
          >
            {label}
          </Label>
        ) : null}
        {!valueTooltip &&
          (typeof value === 'string' || typeof value === 'number' ? (
            <Typography
              component="span"
              variant={valueVariant}
              className="font-semibold"
            >
              {value.toString()}
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
