import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Heading2 = forwardRef<HTMLHeadingElement, PropsOf<'h2'>>(
  ({ className, ...props }, ref) => {
    return (
      <h2 {...props} className={twMerge('heading-2', className)} ref={ref} />
    );
  }
);

Heading2.displayName = 'Heading2';
