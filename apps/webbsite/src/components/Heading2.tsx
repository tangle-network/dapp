import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Heading2 = forwardRef<HTMLHeadingElement, PropsOf<'h1'>>(
  ({ className, ...props }, ref) => {
    return (
      <h1
        {...props}
        className={twMerge(
          'text-[48px] leading-[72px] text-mono-200 font-bold font-satoshi',
          className
        )}
        ref={ref}
      />
    );
  }
);

Heading2.displayName = 'Heading2';

export default Heading2;
