import { Transition } from '@headlessui/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import React, { forwardRef, Fragment } from 'react';

export const ModalContent = forwardRef<
  HTMLDivElement,
  DialogPrimitive.DialogContentProps & { isOpen?: boolean }
>(({ children, isOpen = false, ...props }, ref) => {
  return (
    <Transition.Root show={isOpen}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <DialogPrimitive.Overlay
          forceMount
          className="fixed inset-0 z-5 bg-black/50"
        />
      </Transition.Child>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <DialogPrimitive.Content forceMount {...props} ref={ref}>
          {children}
        </DialogPrimitive.Content>
      </Transition.Child>
    </Transition.Root>
  );
});
