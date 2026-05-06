'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ModalContentProps } from './types';

const getTailwindSizeClass = (size: ModalContentProps['size']) => {
  switch (size) {
    case 'sm':
      return 'max-w-[420px]';
    case 'md':
      return 'max-w-[600px]';
    case 'lg':
      return 'max-w-[800px]';
  }
};

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  (
    {
      children,
      className,
      size = 'md',
      title = 'Modal',
      description = 'Modal',
      ...props
    },
    ref,
  ) => {
    return (
      <Dialog.Portal>
        <Dialog.Overlay
          forceMount
          className={twMerge(
            'fixed inset-0 z-20 bg-black/65 backdrop-blur-[1px]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />

        <Dialog.Content
          forceMount
          {...props}
          className={twMerge(
            // Prevent the focus border from showing.
            'outline-none focus:outline-none focus-visible:outline-none',
            'fixed z-50 w-full rounded-2xl overflow-auto',
            'border dark:border-mono-160',
            'bg-mono-0 dark:bg-mono-180',
            'left-1/2 -translate-x-1/2',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:ease-out data-[state=closed]:ease-in',
            'data-[state=open]:duration-300 md:data-[state=open]:duration-200',
            'data-[state=closed]:duration-200 md:data-[state=closed]:duration-100',
            'data-[state=closed]:slide-out-to-left-1/2 md:data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 md:data-[state=open]:slide-in-from-top-[48%]',
            'data-[state=open]:slide-in-from-bottom-full md:data-[state=open]:fade-in-0 md:data-[state=open]:zoom-in-0',
            'data-[state=closed]:slide-out-to-bottom-full md:data-[state=closed]:fade-out-0 md:data-[state=closed]:zoom-out-0',
            'max-md:bottom-0 max-md:rounded-b-none md:top-1/2 md:-translate-y-1/2',
            // 2rem is for the padding top and bottom of the modal body.
            'max-h-[calc(100vh-2rem)]',
            getTailwindSizeClass(size),
            className,
            'max-sm:max-w-full',
          )}
          ref={ref}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>

          <Dialog.Description className="sr-only">
            {description}
          </Dialog.Description>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    );
  },
);
