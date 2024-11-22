'use client';

import { Transition, TransitionChild } from '@headlessui/react';
import * as Dialog from '@radix-ui/react-dialog';
import { forwardRef, Fragment } from 'react';
import { twMerge } from 'tailwind-merge';
import { ModalContentProps } from './types';
import useIsBreakpoint from '../../hooks/useIsBreakpoint';

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
      isOpen = false,
      className,
      overrideTransitionContentProps,
      overrideTransitionOverlayProps,
      overrideTransitionRootProps,
      size = 'md',
      ...props
    },
    ref,
  ) => {
    const isSmOrLess = useIsBreakpoint('sm', true);
    const isMdOrLess = useIsBreakpoint('md', true);

    return (
      <Transition show={isOpen} {...overrideTransitionRootProps}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          {...overrideTransitionOverlayProps}
        >
          <Dialog.Overlay
            forceMount
            className="fixed inset-0 z-20 bg-black/65 backdrop-blur-[1px]"
          />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter={twMerge(
            'ease-out',
            isMdOrLess ? 'duration-300' : 'duration-200',
          )}
          enterFrom={twMerge(
            isMdOrLess ? 'translate-y-full' : 'opacity-0 top-[calc(50%+15px)]',
          )}
          enterTo={twMerge(isMdOrLess ? 'translate-y-0' : 'opacity-100 top-0')}
          leave={twMerge(
            'ease-in',
            isMdOrLess ? 'duration-200' : 'duration-100',
          )}
          leaveFrom={twMerge(
            isMdOrLess ? 'translate-y-0' : 'opacity-100 top-0',
          )}
          leaveTo={twMerge(
            isMdOrLess ? 'translate-y-full' : 'opacity-0 top-[calc(50%+15px)]',
          )}
          {...overrideTransitionContentProps}
        >
          <Dialog.Content
            forceMount
            {...props}
            className={twMerge(
              'fixed z-50 w-full',
              'bg-mono-0 dark:bg-mono-180 rounded-2xl',
              '-translate-x-1/2 left-1/2',
              isMdOrLess
                ? 'bottom-0 rounded-b-none'
                : 'top-1/2 -translate-y-1/2',
              getTailwindSizeClass(size),
              className,
              isSmOrLess && 'max-w-full',
            )}
            ref={ref}
          >
            <Dialog.Title className="sr-only">Modal</Dialog.Title>

            <Dialog.Description className="sr-only">Modal</Dialog.Description>

            {children}
          </Dialog.Content>
        </TransitionChild>
      </Transition>
    );
  },
);
