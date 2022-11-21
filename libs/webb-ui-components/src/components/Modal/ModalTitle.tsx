import React, { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

export const ModalTitle = forwardRef<
  HTMLHeadingElement,
  DialogPrimitive.DialogTitleProps
>(({ children, ...props }, ref) => {
  return (
    <DialogPrimitive.Title {...props} ref={ref}>
      {children}
    </DialogPrimitive.Title>
  );
});
