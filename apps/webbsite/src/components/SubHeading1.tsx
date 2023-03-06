import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const SubHeading1 = forwardRef<HTMLParagraphElement, PropsOf<'p'>>(
  ({ className, ...props }, ref) => {
    return (
      <p {...props} className={twMerge('sub-heading-1', className)} ref={ref} />
    );
  }
);

SubHeading1.displayName = 'SubHeading';
