'use client';

import { Transition, TransitionChild } from '@headlessui/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import cx from 'classnames';
import { forwardRef, Fragment } from 'react';
import { twMerge } from 'tailwind-merge';
import { ModalContentProps } from './types';

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  (
    {
      children,
      isOpen = false,
      isCenter,
      usePortal,
      className,
      overrideTransitionContentProps,
      overrideTransitionOverlayProps,
      overrideTransitionRootProps,
      ...props
    },
    ref,
  ) => {
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
            className="fixed inset-0 z-20 bg-black/50"
          />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          {...overrideTransitionContentProps}
        >
          <DialogPrimitive.Content
            forceMount
            {...props}
            className={twMerge(
              'fixed z-50',
              cx(
                isCenter
                  ? '-translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'
                  : 'top-0 left-0',
              ),
              'bg-mono-0 dark:bg-mono-180 rounded-2xl',
              className,
            )}
            ref={ref}
          >
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
