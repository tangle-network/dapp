'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { forwardRef } from 'react';

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
