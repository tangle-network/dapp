import { Close } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { ListCardWrapperProps } from './types';

export const ListCardWrapper = forwardRef<HTMLDivElement, ListCardWrapperProps>(
  ({ children, className, onClose, title, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'rounded-xl bg-mono-0 dark:bg-mono-180 p-9',
          className
        )}
        ref={ref}
      >
        {/** The title */}
        <div className="flex items-center justify-between">
          <Typography variant="h5" fw="bold">
            {title}
          </Typography>

          <Close onClick={onClose} size="lg" className="cursor-pointer" />
        </div>

        {children}
      </div>
    );
  }
);
