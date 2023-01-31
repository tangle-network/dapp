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
    ref
  ) => {
    return (
      <div
        {...props}
        className={twMerge('flex items-center space-x-2', className)}
        ref={ref}
      >
        <RadioGroup.Item
          {...overrideRadixRadioItemProps}
          className={twMerge(
            'peer w-[18px] h-[18px] rounded-full bg-mono-0 dark:bg-mono-180 border border-mono-100',
            'enabled:radix-state-unchecked:hover:bg-blue-10 enabled:radix-state-unchecked:hover:dark:bg-blue-120',
            'enabled:radix-state-unchecked:hover:border-blue-40 enabled:radix-state-unchecked:hover:dark:border-blue-90',
            'enabled:radix-state-unchecked:hover:shadow-[0_0_0_1px_rgba(213,230,255,1)] hover:dark:shadow-none',
            'radix-state-checked:border-2 radix-state-checked:border-blue-70 dark:radix-state-checked:border-blue-50',
            'radix-disabled:border-mono-80 dark:radix-disabled:border-mono-120 dark:radix-disabled:bg-mono-140',
            overrideRadixRadioItemProps?.className
          )}
          value={value}
          id={id}
        >
          <RadioGroup.Indicator
            {...overrideRadixRadioIndicatorProps}
            className={twMerge(
              'flex items-center justify-center w-full h-full relative',
              "after:content-[''] after:block after:w-2.5 after:h-2.5 after:rounded-[50%]",
              'after:bg-blue-70 after:dark:bg-blue-50',
              overrideRadixRadioIndicatorProps?.className
            )}
          />
        </RadioGroup.Item>
        {label && (
          <Typography
            component="label"
            variant="body1"
            className={twMerge(
              'text-mono-140 dark:text-mono-20',
              'group-radix-disabled:text-mono-80 dark:group-radix-disabled:text-mono-120',
              'peer-radix-disabled:text-mono-80 dark:peer-radix-disabled:text-mono-120'
            )}
          >
            {label}
          </Typography>
        )}
      </div>
    );
  }
);
