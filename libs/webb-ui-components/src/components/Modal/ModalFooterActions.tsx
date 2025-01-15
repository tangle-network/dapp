import { FC } from 'react';
import { ModalFooter } from './ModalFooter';
import { Button } from '../buttons';

export type ModalFooterActionsProps = {
  isConfirmDisabled?: boolean;
  learnMoreLinkHref?: string;
  isProcessing?: boolean;
  confirmButtonText?: string;
  onConfirm: () => void;
  onClose?: () => void;
};

export const ModalFooterActions: FC<ModalFooterActionsProps> = ({
  isConfirmDisabled = false,
  learnMoreLinkHref,
  isProcessing = false,
  confirmButtonText = 'Confirm',
  onConfirm,
  onClose,
}) => {
  return (
    <ModalFooter>
      {learnMoreLinkHref !== undefined ? (
        <Button
          isFullWidth
          variant="secondary"
          target="_blank"
          rel="noopener noreferrer"
          href={learnMoreLinkHref}
          isDisabled={isProcessing}
          className="hidden sm:flex"
        >
          Learn More
        </Button>
      ) : (
        onClose !== undefined && (
          <Button
            isFullWidth
            variant="secondary"
            isDisabled={isProcessing}
            onClick={onClose}
            className="hidden sm:flex"
          >
            Cancel
          </Button>
        )
      )}

      <Button
        onClick={onConfirm}
        isFullWidth
        className="!mt-0"
        isDisabled={isConfirmDisabled || isProcessing}
        isLoading={isProcessing}
      >
        {confirmButtonText}
      </Button>
    </ModalFooter>
  );
};
