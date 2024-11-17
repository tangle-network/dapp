import { FC } from 'react';
import { ModalFooter } from './ModalFooter';
import { Button } from '../buttons';
import useIsBreakpoint from '../../hooks/useIsBreakpoint';

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
  const isMobile = useIsBreakpoint('md', true);

  return (
    <ModalFooter>
      {/**
       * Remove the secondary button on mobile viewports due to
       * limited space.
       */}
      {learnMoreLinkHref !== undefined && !isMobile ? (
        <Button
          isFullWidth
          variant="secondary"
          target="_blank"
          rel="noopener noreferrer"
          href={learnMoreLinkHref}
          isDisabled={isProcessing}
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
