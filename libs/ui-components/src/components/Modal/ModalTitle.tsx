'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { forwardRef } from 'react';

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
