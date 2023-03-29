import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const SubHeading = forwardRef<HTMLParagraphElement, PropsOf<'p'>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        {...props}
        className={twMerge('sub-heading-1', 'text-mono-140', className)}
        ref={ref}
      />
    );
  }
);

SubHeading.displayName = 'SubHeading';
