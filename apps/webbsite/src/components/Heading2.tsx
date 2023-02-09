import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Heading2 = forwardRef<HTMLHeadingElement, PropsOf<'h1'>>(
  ({ className, ...props }, ref) => {
    return (
      <h2 {...props} className={twMerge('heading-2', className)} ref={ref} />
    );
  }
);

Heading2.displayName = 'Heading2';

export default Heading2;
