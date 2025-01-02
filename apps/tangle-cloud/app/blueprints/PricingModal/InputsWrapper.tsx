import { ComponentProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const InputsWrapper = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className={twMerge(
          'grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 sm:gap-y-4 sm:gap-x-6',
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

InputsWrapper.displayName = 'InputsWrapper';

export default InputsWrapper;
