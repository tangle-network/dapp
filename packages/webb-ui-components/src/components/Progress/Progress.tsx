import * as ProgressPrimitive from '@radix-ui/react-progress';
import React, { useEffect } from 'react';
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
    root: 'h-2 overflow-hidden rounded-full bg-mono-80 dark:bg-mono-140',
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

export const Progress: React.FC<ProgressProps> = ({ className, max, prefixLabel, size = 'md', suffixLabel, value }) => {
  return (
    <ProgressPrimitive.Root value={value} className={twMerge(classNames[size]['root'], className)} max={max}>
      <ProgressPrimitive.Indicator style={{ width: `${value}%` }} className={classNames[size]['indicator']}>
        {size !== 'md' && (
          <span className={classNames[size]['label']}>
            {prefixLabel}
            {value}
            {suffixLabel}
          </span>
        )}
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
};
