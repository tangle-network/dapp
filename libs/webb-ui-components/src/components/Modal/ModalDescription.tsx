import React, { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  DialogPrimitive.DialogDescriptionProps
>(({ children, ...props }, ref) => {
  return (
    <DialogPrimitive.Description {...props} ref={ref}>
      {children}
    </DialogPrimitive.Description>
  );
});
