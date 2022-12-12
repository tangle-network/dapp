import { PropsOf } from '@webb-tools/webb-ui-components/types';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Button = forwardRef<HTMLButtonElement, PropsOf<'button'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        {...props}
        className={twMerge(
          'rounded-full px-9 py-2 bg-mono-200 border-2 border-transparent text-mono-0 font-bold',
          'hover:bg-mono-160 active:border-mono-200',
          className
        )}
        ref={ref}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
