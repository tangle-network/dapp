import { Typography } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const SectionDescription2 = forwardRef<
  HTMLParagraphElement,
  PropsOf<'p'>
>(({ className, ...props }, ref) => {
  return (
    <Typography
      variant="para1"
      {...props}
      className={twMerge('section-description-2', className)}
      ref={ref}
    />
  );
});

SectionDescription2.displayName = 'SectionDescription2';
