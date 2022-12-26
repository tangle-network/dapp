import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Heading2 = forwardRef<HTMLHeadingElement, PropsOf<'h1'>>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        {...props}
        className={twMerge(
          'text-[30px] leading-[41px] text-mono-200 font-bold font-satoshi',
          'md:text-[48px] md:leading-[72px]',
          className
        )}
        ref={ref}
      />
    );
  }
);

Heading2.displayName = 'Heading2';

export default Heading2;
