import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { IconButtonProps } from './types';

const IconButton = forwardRef<React.ElementRef<'button'>, IconButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        {...props}
        type="button"
        ref={ref}
        className={twMerge(
          'p-2 rounded-lg',
          'hover:bg-mono-20 dark:hover:bg-mono-160',
          'text-mono-200 dark:text-mono-0',
          className
        )}
      />
    );
  }
);
IconButton.displayName = 'IconButton';

export default IconButton;
