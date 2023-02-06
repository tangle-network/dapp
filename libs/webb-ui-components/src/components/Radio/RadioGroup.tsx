import { Root } from '@radix-ui/react-radio-group';
import { forwardRef } from 'react';
import { RadioGroupProps } from './types';
import { twMerge } from 'tailwind-merge';

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <Root {...props} className={twMerge('group', className)} ref={ref} />
    );
  }
);
