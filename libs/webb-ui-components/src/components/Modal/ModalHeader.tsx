import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ModalHeaderProps } from './types';
import { Typography } from '../../typography/Typography';
import { Close as CloseIcon } from '@webb-tools/icons';

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, className, onClose, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'p-9 pb-0 flex items-center justify-between',
          className
        )}
        ref={ref}
      >
        <Typography variant="h5" fw="bold">
          {children}
        </Typography>

        <button className="inline-block" onClick={onClose}>
          <CloseIcon size="lg" />
        </button>
      </div>
    );
  }
);
