'use client';

import * as RadioGroup from '@radix-ui/react-radio-group';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography';
import { RadioItemProps } from './types';

export const RadioItem = forwardRef<HTMLDivElement, RadioItemProps>(
  (
    {
      className,
      id,
      children: label,
      overrideRadixRadioIndicatorProps,
      overrideRadixRadioItemProps,
      value,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        {...props}
        className={twMerge('flex items-center space-x-1', className)}
        ref={ref}
      >
        <div className="size-[36px] group rounded-full hover:bg-[#5953F91A] hover:dark:bg-[#5953F933] flex items-center justify-center has-[:disabled]:hover:!bg-transparent has-[:radix-state-checked]:!bg-[#5953F933] has-[:radix-state-checked]:dark:!bg-[#5953F94D]">
          <RadioGroup.Item
            {...overrideRadixRadioItemProps}
            className={twMerge(
              'peer group size-[18px] rounded-full border-[2px] border-mono-100 dark:border-mono-100',
              'radix-disabled:border-mono-60 dark:radix-disabled:border-mono-140',
              'radix-disabled:radix-state-checked:border-mono-60 dark:radix-disabled:radix-state-checked:border-mono-140',
              'radix-state-checked:border-blue-60 dark:radix-state-checked:border-blue-40',
              'radix-state-checked:hover:border-blue-50 dark:radix-state-checked:hover:border-blue-50',
              overrideRadixRadioItemProps?.className,
            )}
            value={value}
            id={id}
          >
            <RadioGroup.Indicator
              {...overrideRadixRadioIndicatorProps}
              className={twMerge(
                'flex items-center justify-center w-full h-full relative',
                "after:content-[''] after:block after:w-2.5 after:h-2.5 after:rounded-[50%]",
                'radix-state-checked:after:bg-blue-60 radix-state-checked:after:dark:bg-blue-40',
                'radix-state-checked:hover:after:bg-blue-50 radix-state-checked:hover:after:dark:bg-blue-50',
                'radix-disabled:radix-state-checked:after:bg-mono-60 dark:radix-disabled:radix-state-checked:after:bg-mono-140',
                overrideRadixRadioIndicatorProps?.className,
              )}
            />
          </RadioGroup.Item>
        </div>

        {typeof label === 'string' || typeof label === 'number' ? (
          <Typography
            component="label"
            variant="body1"
            className={twMerge(
              'text-mono-140 dark:text-mono-20',
              'group-radix-disabled:text-mono-80 dark:group-radix-disabled:text-mono-120',
              'peer-radix-disabled:text-mono-80 dark:peer-radix-disabled:text-mono-120',
            )}
          >
            {label}
          </Typography>
        ) : (
          label
        )}
      </div>
    );
  },
);
