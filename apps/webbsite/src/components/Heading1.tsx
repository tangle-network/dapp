import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Heading1 = forwardRef<HTMLHeadingElement, PropsOf<'h1'>>(
  ({ className, ...props }, ref) => {
    return (
      <h1
        {...props}
        className={twMerge(
          'text-[32px] leading-[46px] tracking-tight font-bold text-mono-200 font-satoshi',
          'md:text-[84px] md:leading-[96px] md:tracking-normal',
          className
        )}
        ref={ref}
      />
    );
  }
);

Heading1.displayName = 'Heading1';

export default Heading1;
