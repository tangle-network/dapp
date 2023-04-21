import { Typography } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const SectionTitle2 = forwardRef<HTMLHeadingElement, PropsOf<'h3'>>(
  ({ className, ...props }, ref) => {
    return (
      <Typography
        variant="h3"
        fw="bold"
        {...props}
        className={twMerge('text-center', className)}
        ref={ref}
      />
    );
  }
);

SectionTitle2.displayName = 'SectionTitle2';
