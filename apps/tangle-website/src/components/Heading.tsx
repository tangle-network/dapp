import { Typography } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Heading = forwardRef<HTMLHeadingElement, PropsOf<'h1'>>(
  ({ className, ...props }, ref) => {
    return (
      <Typography
        variant="h1"
        fw="bold"
        {...props}
        className={twMerge('heading', className)}
        ref={ref}
      />
    );
  }
);

Heading.displayName = 'Heading';
