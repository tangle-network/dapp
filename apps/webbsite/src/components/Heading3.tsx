import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Heading3 = forwardRef<HTMLHeadingElement, PropsOf<'h1'>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        {...props}
        className={twMerge(
          'text-[24px] leading-8 text-mono-200 font-black font-satoshi',
          'md:text-[36px] md:leading-[54px]',
          className
        )}
        ref={ref}
      />
    );
  }
);

Heading3.displayName = 'Heading3';

export default Heading3;
