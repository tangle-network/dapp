import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { PropsOf } from '../../types';

export const ModalFooter = forwardRef<HTMLDivElement, PropsOf<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'space-y-2 px-8 py-6 border-t border-mono-60 dark:border-mono-140',
          className
        )}
        ref={ref}
      />
    );
  }
);
