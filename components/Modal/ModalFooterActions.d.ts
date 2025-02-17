import { FC } from '../../../../../node_modules/react';
export type ModalFooterActionsProps = {
    isConfirmDisabled?: boolean;
    learnMoreLinkHref?: string;
    isProcessing?: boolean;
    confirmButtonText?: string;
    hasCloseButton?: boolean;
    onConfirm: () => void;
};
export declare const ModalFooterActions: FC<ModalFooterActionsProps>;
