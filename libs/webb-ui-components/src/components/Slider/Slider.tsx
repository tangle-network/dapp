import * as SliderPrimitive from '@radix-ui/react-slider';
import cx from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { SliderProps, SliderThumbProps } from './types';

/**
 * The `Slider` component
 *
 * Props:
 *
 * - `defaultValue`: The value of the slider when initially rendered. Use when you do not need to control the state of the slider.
 * - `value`: The controlled value of the slider. Must be used in conjunction with `onChange`.
 * - `onChange`: Event handler called when the value changes.
 * - `minStepsBetweenThumbs`: The minimum permitted steps between multiple.
 * - `name`: The name of the slider. Submitted with its owning form as part of a name/value pair.
 * - `isDisabled`: When true, prevents the user from interacting with the slider.
 * - `min`: The minimum value for the range.
 * - `max`: The maximum value for the range
 * - `step`: The stepping interval.
 *
 * ```jsx
 *  <Slider className='mt-4' defaultValue={[25]} />
 *  <Slider className='mt-4' hasLabel defaultValue={[25]} />
 *  <Slider className='mt-4' value={sliderVal} onChange={setSliderVal} />
 *  <Slider className='mt-4' hasLabel defaultValue={[25, 75]} />
 * ```
 */
export const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  ({ className, defaultValue, hasLabel, isDisabled, onChange, value: valueProp, ...props }, ref) => {
    // Internal state to display labels
    const [value, setValue] = useState<number[] | undefined>(valueProp ?? defaultValue);

    useEffect(() => {
      if (!value || !value.length || value.length > 2) {
        throw new Error(
          '[Slider.tsx] You must provide `defaultValue` or `value` and `value.length` should less than 3 to the Slider component'
        );
      }
    }, [value]);

    const onValueChange = useCallback(
      (nextVal: number[]) => {
        setValue(nextVal);
        if (onChange) {
          onChange(nextVal);
        }
      },
      [onChange]
    );

    return (
      <div className={twMerge('min-w-[495px] min-h-[36px] flex items-end', className)}>
        <SliderPrimitive.Root
          {...props}
          defaultValue={value}
          ref={ref}
          aria-label='value'
          className={'relative flex items-center w-full h-4 touch-none'}
          value={value}
          onValueChange={onValueChange}
        >
          <SliderPrimitive.Track className='relative w-full h-2 rounded-full bg-mono-80 dark:bg-mono-140 grow'>
            <SliderPrimitive.Range className='absolute h-full rounded-full bg-blue dark:bg-blue-50' />
          </SliderPrimitive.Track>

          {value?.length === 1 && <SliderThumb hasLabel={hasLabel} value={value[0]} />}

          {value?.length === 2 && (
            <>
              <SliderThumb hasLabel={hasLabel} value={value[0]} />
              <SliderThumb hasLabel={hasLabel} value={value[1]} />
            </>
          )}
        </SliderPrimitive.Root>
      </div>
    );
  }
);

/***** Internal components */

function SliderThumb({ hasLabel, value }: SliderThumbProps) {
  return (
    <SliderPrimitive.Thumb
      className={cx(
        'block relative h-4 w-4 rounded-full',
        'bg-blue dark:bg-blue-50',
        'cursor-pointer',
        'focus:outline-none dark:focus:outline-none',
        'focus-visible:outline-none dark:focus-visible:outline-none',
        'focus:ring',
        'focus:ring-blue-50 dark:focus:ring-blue-60',
        'focus:ring-opacity-75 dark:focus:ring-opacity-50'
      )}
    >
      {hasLabel && <span className='absolute left-0 translate-x-1/4 -top-5 utility'>{value}</span>}
    </SliderPrimitive.Thumb>
  );
}
