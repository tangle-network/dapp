import { FC } from 'react';
import { ModalFooter } from './ModalFooter';
import { Button } from '../buttons';
import { DialogClose } from '@radix-ui/react-dialog';

export type ModalFooterActionsProps = {
  isConfirmDisabled?: boolean;
  learnMoreLinkHref?: string;
  isProcessing?: boolean;
  confirmButtonText?: string;
  hasCloseButton?: boolean;
  onConfirm: () => void;
};

export const ModalFooterActions: FC<ModalFooterActionsProps> = ({
  isConfirmDisabled = false,
  learnMoreLinkHref,
  isProcessing = false,
  confirmButtonText = 'Confirm',
  onConfirm,
  hasCloseButton,
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
        hasCloseButton && (
          <DialogClose asChild>
            <Button
              isFullWidth
              variant="secondary"
              isDisabled={isProcessing}
              className="hidden sm:flex"
            >
              Cancel
            </Button>
          </DialogClose>
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
