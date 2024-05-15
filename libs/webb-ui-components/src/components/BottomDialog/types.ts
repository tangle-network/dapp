import type {
  DialogProps as RdxDialogProps,
  DialogTriggerProps as RdxDialogTriggerProps,
  DialogPortalProps as RdxDialogPortalProps,
  DialogOverlayProps as RdxDialogOverlayProps,
  DialogContentProps as RdxDialogContentProps,
} from '@radix-ui/react-dialog';

import type { PropsOf, IWebbComponentBase } from '../../types/index.js';
import type { ButtonProps } from '../buttons/types.js';

export interface BottomDialogProps extends PropsOf<'div'>, IWebbComponentBase {
  radixRootProps?: RdxDialogProps;
}

export interface BottomDialogTriggerProps
  extends IWebbComponentBase,
    RdxDialogTriggerProps {}

export interface BottomDialogPortalProps
  extends IWebbComponentBase,
    RdxDialogPortalProps {
  title?: string;
  actionButtonsProps?: ButtonProps[];
  overlayProps?: RdxDialogOverlayProps;
  contentProps?: RdxDialogContentProps;
}
