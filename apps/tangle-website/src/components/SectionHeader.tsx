import { Typography } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const SectionHeader = forwardRef<HTMLHeadingElement, PropsOf<'h5'>>(
  ({ className, ...props }, ref) => {
    return (
      <Typography
        variant="h5"
        {...props}
        className={twMerge(
          'uppercase font-bold text-tangle_purple dark:text-tangle_dark_purple',
          className
        )}
        ref={ref}
      />
    );
  }
);

SectionHeader.displayName = 'SectionHeader';
