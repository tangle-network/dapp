import { Transition } from '@headlessui/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FC, useCallback, useEffect, useState } from 'react';

export const Modal: FC<DialogPrimitive.DialogProps> = ({
  children,
  open,
  defaultOpen = false,
  onOpenChange: onOpenChangeProps,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(open ?? defaultOpen);

  useEffect(() => {
    setIsOpen(open ?? defaultOpen);
  }, [open, setIsOpen]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChangeProps?.(open);
    },
    [setIsOpen, onOpenChangeProps]
  );

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange} {...props}>
      {/* <Transition.Root show={isOpen}>{children}</Transition.Root> */}
      {children}
    </DialogPrimitive.Root>
  );
};
