import { Typography } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const SectionTitle = forwardRef<HTMLHeadingElement, PropsOf<'h2'>>(
  ({ className, ...props }, ref) => {
    return (
      <Typography
        variant="h2"
        fw="bold"
        {...props}
        className={twMerge('text-center', className)}
        ref={ref}
      />
    );
  }
);

SectionTitle.displayName = 'SectionTitle';
