import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Close } from '../../icons';
import { PropsOf } from '../../types';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { DrawerContentProps } from './types';

const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;

const DrawerCloseButton = forwardRef<HTMLButtonElement, PropsOf<'button'>>((props, ref) => (
  <DialogPrimitive.Close asChild>
    <button {...props} ref={ref}>
      <Close size='lg' />
    </button>
  </DialogPrimitive.Close>
));

const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(({ children, className, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cx(
        'fixed top-0 bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.15)]',
        'radix-state-open:animate-drawer-overlay-open radix-state-closed:animate-drawer-overlay-close'
      )}
    />
    <DialogPrimitive.Content {...props} className={twMerge('drawer-content', className)} ref={ref}>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));

const DrawerTitle = DialogPrimitive.Title;
const DrawerDescription = DialogPrimitive.Description;

export { Drawer, DrawerTrigger, DrawerCloseButton, DrawerContent, DrawerTitle, DrawerDescription };
