import { forwardRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { BottomDialogProps } from './types';

export const BottomDialog = forwardRef<HTMLDivElement, BottomDialogProps>(
  ({ children, className, radixRootProps, ...props }, ref) => {
    return (
      <div {...props} className={className} ref={ref}>
        <Dialog.Root {...radixRootProps}>{children}</Dialog.Root>
      </div>
    );
  },
);
