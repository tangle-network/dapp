import {
  AddCircleFillIcon,
  AddCircleLineIcon,
  IndeterminateCircleFillIcon,
  IndeterminateCircleLineIcon,
} from '@webb-tools/icons';
import Decimal from 'decimal.js';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Input } from '../Input';
import { AdjustAmountProps } from './types';

/**
 * The `AdjustAmount` component
 *
 * Props:
 *
 * - `id`: The `id` prop for label and input (defaults to "adjust-amount")
 * - `value`: The value prop
 * - `onChange`: The callback function to control the component
 * - `min`: The minimum value
 * - `max`: The maximum value
 * - `step`: The step value (defaults to 0.5)
 *
 * @example
 *
 * ```jsx
 * <AdjustAmount value={value} onChange={(nextVal) => setValue(nextVal)} />
 * ```
 */
export const AdjustAmount = forwardRef<HTMLDivElement, AdjustAmountProps>(
  (
    {
      className,
      iconClassName,
      id = 'adjust-amount',
      isDisabled,
      max,
      min,
      onChange,
      step = 0.5,
      value: valueProp = 0,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState(valueProp);

    // Subscribes to the `value` prop
    useEffect(() => {
      setValue(valueProp);
    }, [valueProp]);

    const sharedIconBtnClsx = useMemo(
      () =>
        twMerge(
          'group',
          'fill-mono-160 hover:fill-mono-200 disabled:fill-mono-100',
          'dark:fill-mono-40 dark:disabled:fill-mono-120',
          iconClassName
        ),
      [iconClassName]
    );

    const handleMinusClick = useCallback(() => {
      const nextVal = new Decimal(value).minus(step);

      // If the component is disabled or `min` is defined and `nextVal` is less than `min`,
      // then we don't need to update the value
      if (isDisabled || (typeof min === 'number' && nextVal.lt(min))) {
        return;
      }

      setValue(nextVal.toNumber());
      onChange?.(nextVal.toNumber());
    }, [isDisabled, min, onChange, step, value]);

    const handlePlusClick = useCallback(() => {
      const nextVal = new Decimal(value).plus(step);

      // If the component is disabled or `max` is defined and `nextVal` is greater than `max`,
      // then we don't need to update the value
      if (isDisabled || (typeof max === 'number' && nextVal.gt(max))) {
        return;
      }

      setValue(nextVal.toNumber());
      onChange?.(nextVal.toNumber());
    }, [isDisabled, max, onChange, step, value]);

    return (
      <div
        {...props}
        ref={ref}
        className={twMerge('flex gap-6 items-center', className)}
      >
        <button
          className={sharedIconBtnClsx}
          onClick={handleMinusClick}
          disabled={
            isDisabled ?? Boolean(typeof min === 'number' && value <= min)
          }
        >
          <IndeterminateCircleLineIcon
            className="group-hover:group-enabled:hidden !fill-inherit"
            size="lg"
          />
          <IndeterminateCircleFillIcon
            className="hidden group-hover:group-enabled:inline-block !fill-inherit"
            size="lg"
          />
        </button>

        <Input
          style={{ textAlign: 'center' }}
          autoComplete="off"
          inputMode="numeric"
          size="sm"
          type="number"
          isReadOnly
          id={id}
          isDisabled={isDisabled}
          value={`${value}`}
        />

        <button
          className={sharedIconBtnClsx}
          onClick={handlePlusClick}
          disabled={
            isDisabled ?? Boolean(typeof max === 'number' && value >= max)
          }
        >
          <AddCircleLineIcon
            className="group-hover:group-enabled:hidden !fill-inherit"
            size="lg"
          />
          <AddCircleFillIcon
            className="hidden group-hover:group-enabled:inline-block !fill-inherit"
            size="lg"
          />
        </button>
      </div>
    );
  }
);
