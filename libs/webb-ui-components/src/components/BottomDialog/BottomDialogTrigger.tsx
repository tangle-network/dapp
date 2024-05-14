import { forwardRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { BottomDialogTriggerProps } from './types.js';

export const BottomDialogTrigger = forwardRef<
  HTMLButtonElement,
  BottomDialogTriggerProps
>((props, ref) => {
  return <Dialog.Trigger asChild {...props} ref={ref} />;
});
