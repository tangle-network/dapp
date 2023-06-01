import {
  DialogProps as RdxDialogProps,
  DialogTriggerProps as RdxDialogTriggerProps,
  DialogPortalProps as RdxDialogPortalProps,
  DialogOverlayProps as RdxDialogOverlayProps,
  DialogContentProps as RdxDialogContentProps,
} from '@radix-ui/react-dialog';

import { IWebbComponentBase } from '../../types';
import { ButtonProps } from '../Button/types';

export interface BottomDialogProps extends IWebbComponentBase, RdxDialogProps {}

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
