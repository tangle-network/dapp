import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Heading3 = forwardRef<HTMLHeadingElement, PropsOf<'h1'>>(
  ({ className, ...props }, ref) => {
    return (
      <h1
        {...props}
        className={twMerge(
          'text-[36px] leading-[54px] text-mono-200 font-black font-satoshi',
          className
        )}
        ref={ref}
      />
    );
  }
);

Heading3.displayName = 'Heading3';

export default Heading3;
