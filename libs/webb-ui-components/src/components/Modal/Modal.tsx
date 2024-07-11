'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FC, useCallback, useState } from 'react';

export const Modal: FC<DialogPrimitive.DialogProps> = ({
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
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange} {...props}>
      {children}
    </DialogPrimitive.Root>
  );
};
