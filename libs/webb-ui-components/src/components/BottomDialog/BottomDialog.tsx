import { forwardRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { BottomDialogProps } from './types';

export const BottomDialog = forwardRef<HTMLDivElement, BottomDialogProps>(
  (props, _) => {
    return <Dialog.Root {...props} />;
  }
);
