'use client';

import { Transition, TransitionChild } from '@headlessui/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
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
      return 'max-w-[840px]';
  }
};

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  (
    {
      children,
      isOpen = false,
      usePortal,
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

    const inner = (
      <Transition show={isOpen} {...overrideTransitionRootProps}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          {...overrideTransitionOverlayProps}
        >
          <DialogPrimitive.Overlay
            forceMount
            className="fixed inset-0 z-20 bg-black/65"
          />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom={twMerge(
            isMdOrLess ? 'translate-y-full' : 'opacity-0 scale-95',
          )}
          enterTo={twMerge(
            isMdOrLess ? 'translate-y-0' : 'opacity-100 scale-100',
          )}
          leave="ease-in duration-200"
          leaveFrom={twMerge(
            isMdOrLess ? 'translate-y-0' : 'opacity-100 scale-100',
          )}
          leaveTo={twMerge(
            isMdOrLess ? 'translate-y-full' : 'opacity-0 scale-95',
          )}
          {...overrideTransitionContentProps}
        >
          <DialogPrimitive.Content
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
            <DialogPrimitive.Title className="sr-only">
              Modal
            </DialogPrimitive.Title>

            <DialogPrimitive.Description className="sr-only">
              Modal
            </DialogPrimitive.Description>

            {children}
          </DialogPrimitive.Content>
        </TransitionChild>
      </Transition>
    );

    if (usePortal) {
      return <DialogPrimitive.Portal>{inner}</DialogPrimitive.Portal>;
    }

    return inner;
  },
);
