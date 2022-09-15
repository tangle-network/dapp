import * as ProgressPrimitive from '@radix-ui/react-progress';
import cx from 'classnames';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { ProgressClassName, ProgressProps } from './types';

const classNames: ProgressClassName = {
  sm: {
    root: 'h-6 overflow-hidden rounded-lg bg-mono-20 dark:bg-mono-140',
    indicator:
      'flex items-center justify-center h-full duration-300 ease-in-out rounded-l-lg bg-green-0 dark:bg-blue-120',
    label: 'font-semibold body3 text-green dark:text-blue-40',
  },
  md: {
    root: 'h-2 overflow-hidden rounded-full bg-mono-40 dark:bg-mono-140',
    indicator:
      'flex items-center justify-center h-full duration-300 ease-in-out rounded-l-full bg-blue dark:bg-blue-50',
    label: '',
  },
  lg: {
    root: 'h-[60px] overflow-hidden rounded-lg bg-mono-20 dark:bg-mono-160',
    indicator:
      'flex items-center justify-center h-full duration-300 ease-in-out rounded-l-lg bg-blue-0 dark:bg-blue-120',
    label: 'font-bold body3 text-blue dark:text-blue-40',
  },
};

/**
 * The `Progress` component
 *
 * @example
 *
 * ```jsx
 *    <Progress size='sm' value={60} />
 *    <Progress value={60} />
 *    <Progress size='lg' value={60} />
 * ```
 */
export const Progress: React.FC<ProgressProps> = ({ className, max, prefixLabel, size = 'md', suffixLabel, value }) => {
  return (
    <ProgressPrimitive.Root value={value} className={twMerge(classNames[size]['root'], className)} max={max}>
      <ProgressPrimitive.Indicator
        style={{ width: `${value}%` }}
        className={cx(
          classNames[size]['indicator'],
          ' radix-state-indeterminate:bg-transparent dark:radix-state-indeterminate:bg-transparent'
        )}
      >
        {size !== 'md' && (
          <span className={classNames[size]['label']}>
            {/** If have value or the progress size not equal to 'lg' => Display the `prefixLabel` */}
            {(value || size !== 'lg') && prefixLabel}
            {/** Display the value if the value have content, otherwise if the size is equal to "sm" display '0', otherwise displays "Unavailable" */}
            {value ? value : size === 'sm' ? '0' : 'Unavailable'}
            {/** If have value or the progress size not equal to 'lg' => Display the `suffixLabel` */}
            {(value || size !== 'lg') && suffixLabel}
          </span>
        )}
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
};
