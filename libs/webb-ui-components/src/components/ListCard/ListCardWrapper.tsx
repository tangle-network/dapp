import { Close } from '@webb-tools/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';

import { ListCardWrapperProps } from './types';

export const ListCardWrapper = forwardRef<HTMLDivElement, ListCardWrapperProps>(
  (
    { children, className, onClose, title, hideCloseButton = false, ...props },
    ref
  ) => {
    return (
      <div
        {...props}
        className={twMerge(
          'flex flex-col',
          'rounded-xl bg-mono-0 dark:bg-mono-190 w-full max-w-xl p-9',
          className
        )}
        ref={ref}
      >
        {/** The title */}
        <div className="flex items-center justify-between">
          <Typography variant="h5" fw="bold">
            {title}
          </Typography>

          {!hideCloseButton && (
            <Close onClick={onClose} size="lg" className="cursor-pointer" />
          )}
        </div>

        {children}
      </div>
    );
  }
);
