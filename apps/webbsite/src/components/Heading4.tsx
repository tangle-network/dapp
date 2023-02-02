import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Heading4 = forwardRef<HTMLHeadingElement, PropsOf<'h1'>>(
  ({ className, ...props }, ref) => {
    return (
      <h4 {...props} className={twMerge('heading-4', className)} ref={ref} />
    );
  }
);

Heading4.displayName = 'Heading4';

export default Heading4;
