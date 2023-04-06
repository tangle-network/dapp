import { Typography } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const SectionDescription = forwardRef<HTMLParagraphElement, PropsOf<'p'>>(
  ({ className, ...props }, ref) => {
    return (
      <Typography
        variant="para1"
        {...props}
        className={twMerge('section-description', className)}
        ref={ref}
      />
    );
  }
);

SectionDescription.displayName = 'SectionDescription';
