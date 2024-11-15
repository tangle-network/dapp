import { FC } from 'react';
import { ModalFooter } from './ModalFooter';
import { Button } from '../buttons';
import useIsBreakpoint from '../../hooks/useIsBreakpoint';

export type ModalFooterTxActionsProps = {
  isDisabled: boolean;
  learnMoreLinkHref?: string;
  isProcessing: boolean;
  onConfirm: () => void;
};

export const ModalFooterTxActions: FC<ModalFooterTxActionsProps> = ({
  isDisabled,
  learnMoreLinkHref,
  isProcessing,
  onConfirm,
}) => {
  const isMobile = useIsBreakpoint('md', true);

  return (
    <ModalFooter>
      {learnMoreLinkHref !== undefined && !isMobile && (
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
      )}

      <Button
        onClick={onConfirm}
        isFullWidth
        target="_blank"
        rel="noopener noreferrer"
        className="!mt-0"
        isDisabled={isDisabled || isProcessing}
        isLoading={isProcessing}
      >
        Confirm
      </Button>
    </ModalFooter>
  );
};
