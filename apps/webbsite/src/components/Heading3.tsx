import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const Heading3 = forwardRef<HTMLHeadingElement, PropsOf<'h3'>>(
  ({ className, ...props }, ref) => {
    return (
      <h3 {...props} className={twMerge('heading-3', className)} ref={ref} />
    );
  }
);

Heading3.displayName = 'Heading3';
