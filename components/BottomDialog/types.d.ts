import { DialogProps as RdxDialogProps, DialogTriggerProps as RdxDialogTriggerProps, DialogPortalProps as RdxDialogPortalProps, DialogOverlayProps as RdxDialogOverlayProps, DialogContentProps as RdxDialogContentProps } from '@radix-ui/react-dialog';
import { PropsOf, IComponentBase } from '../../types';
import { ButtonProps } from '../buttons/types';
export interface BottomDialogProps extends PropsOf<'div'>, IComponentBase {
    radixRootProps?: RdxDialogProps;
}
export interface BottomDialogTriggerProps extends IComponentBase, RdxDialogTriggerProps {
}
export interface BottomDialogPortalProps extends IComponentBase, RdxDialogPortalProps {
    title?: string;
    actionButtonsProps?: ButtonProps[];
    overlayProps?: RdxDialogOverlayProps;
    contentProps?: RdxDialogContentProps;
}
