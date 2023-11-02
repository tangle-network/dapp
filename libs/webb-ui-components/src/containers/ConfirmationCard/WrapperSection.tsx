import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { PropsOf } from '../../types';

export const WrapperSection = forwardRef<HTMLDivElement, PropsOf<'div'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'px-4 py-2 rounded-lg bg-mono-20 dark:bg-mono-180',
          className
        )}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

export default WrapperSection;
