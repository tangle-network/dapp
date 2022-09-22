import * as ProgressPrimitive from '@radix-ui/react-progress';
import cx from 'classnames';
import React, { useMemo } from 'react';
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
export const Progress: React.FC<ProgressProps> = ({
  className,
  max,
  prefixLabel = '',
  size = 'md',
  suffixLabel = '',
  value: valueProp,
}) => {
  const hasValue = useMemo(() => !!valueProp, [valueProp]);

  const displayValue = useMemo(() => {
    // Not display the value if the size is "md"
    if (size === 'md') {
      return '';
    }

    // If the valueProp has value or the progress size not equal to 'lg' => Displays the `prefixLabel` if it has value
    const prefix = typeof valueProp === 'number' || size !== 'lg' ? prefixLabel : '';

    // Display the value if it is not null, otherwise if the size is equal to "sm" display '0', otherwise displays "Unavailable"
    const value = typeof valueProp === 'number' ? valueProp : size === 'sm' ? '0' : 'Unavailable';

    // If the valueProp has value or the progress size not equal to 'lg' => Display the `suffixLabel` if it has value
    const suffix = typeof valueProp === 'number' || size !== 'lg' ? suffixLabel : '';

    return `${prefix}${value}${suffix}`;
  }, [prefixLabel, size, suffixLabel, valueProp]);

  return (
    <ProgressPrimitive.Root value={valueProp} className={twMerge(classNames[size]['root'], className)} max={max}>
      {hasValue && (
        <ProgressPrimitive.Indicator
          style={{ width: `${valueProp}%` }}
          className={cx(
            classNames[size]['indicator'],
            'radix-state-indeterminate:bg-transparent dark:radix-state-indeterminate:bg-transparent'
          )}
        >
          <span className={classNames[size]['label']}>{displayValue}</span>
        </ProgressPrimitive.Indicator>
      )}

      {!hasValue && (
        <span className={cx(classNames[size]['label'], 'w-full h-full flex justify-center items-center')}>
          {displayValue}
        </span>
      )}
    </ProgressPrimitive.Root>
  );
};
