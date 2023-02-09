import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const SubHeading = forwardRef<HTMLParagraphElement, PropsOf<'p'>>(
  ({ className, ...props }, ref) => {
    return (
      <p {...props} className={twMerge('sub-heading-1', className)} ref={ref} />
    );
  }
);

SubHeading.displayName = 'SubHeading';

export default SubHeading;
