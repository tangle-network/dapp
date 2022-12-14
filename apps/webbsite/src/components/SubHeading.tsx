import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const SubHeading = forwardRef<HTMLParagraphElement, PropsOf<'p'>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        {...props}
        className={twMerge(
          'text-2xl font-medium leading-9 text-mono-180',
          className
        )}
        ref={ref}
      />
    );
  }
);

SubHeading.displayName = 'SubHeading';

export default SubHeading;
