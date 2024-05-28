'use client';

import { DialogTrigger, DialogTriggerProps } from '@radix-ui/react-dialog';
import { forwardRef } from 'react';

export const ModalTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  (props, ref) => {
    return <DialogTrigger {...props} ref={ref} />;
  },
);
