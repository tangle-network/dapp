import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const SubHeading2 = forwardRef<HTMLParagraphElement, PropsOf<'p'>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        {...props}
        className={twMerge(
          'text-[18px] leading-[27px] font-medium text-mono-180',
          className
        )}
        ref={ref}
      />
    );
  }
);

SubHeading2.displayName = 'SubHeading2';

export default SubHeading2;
