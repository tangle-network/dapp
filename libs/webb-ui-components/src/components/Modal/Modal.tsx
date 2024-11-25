'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { FC, useCallback, useState } from 'react';

export const Modal: FC<Dialog.DialogProps> = ({
  children,
  open,
  defaultOpen = false,
  onOpenChange: onOpenChangeProps,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(open ?? defaultOpen);

  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChangeProps?.(open);
    },
    [setIsOpen, onOpenChangeProps],
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange} {...props}>
      {children}
    </Dialog.Root>
  );
};
