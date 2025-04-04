import { Close as CloseIcon } from '@tangle-network/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { ModalHeaderProps } from './types';
import { DialogClose } from '@radix-ui/react-dialog';

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, className, onClose, titleVariant = 'h4', ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'p-9 pb-0 flex items-center justify-between',
          className,
        )}
        ref={ref}
      >
        <Typography variant={titleVariant} fw="bold">
          {children}
        </Typography>

        <DialogClose asChild>
          <button className="inline-block" onClick={onClose}>
            <CloseIcon size="lg" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </div>
    );
  },
);
