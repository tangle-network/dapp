import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ModalHeaderProps } from './types.js';
import { Typography } from '../../typography/Typography/index.js';
import { Close as CloseIcon } from '@webb-tools/icons';

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, className, onClose, titleVariant = 'h5', ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'p-9 pb-0 flex items-center justify-between',
          className
        )}
        ref={ref}
      >
        <Typography variant={titleVariant} fw="bold">
          {children}
        </Typography>

        <button className="inline-block" onClick={onClose}>
          <CloseIcon size="lg" />
        </button>
      </div>
    );
  }
);
