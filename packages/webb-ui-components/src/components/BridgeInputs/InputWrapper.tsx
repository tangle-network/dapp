import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { InputWrapperProps } from './types';

export const InputWrapper = forwardRef<HTMLDivElement, InputWrapperProps>(({ children, className, ...props }, ref) => {
  const mergedClsx = useMemo(
    () =>
      twMerge(
        'bg-mono-0 dark:bg-mono-140 px-4 py-2 min-w-[350px] rounded-lg flex items-center justify-between cursor-pointer',
        className
      ),
    [className]
  );

  return (
    <div {...props} className={mergedClsx} ref={ref}>
      {children}
    </div>
  );
});
