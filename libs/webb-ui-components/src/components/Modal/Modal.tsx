'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { FC } from 'react';

export const Modal: FC<Dialog.DialogProps> = ({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}) => {
  return (
    <Dialog.Root
      {...props}
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    >
      {children}
    </Dialog.Root>
  );
};
