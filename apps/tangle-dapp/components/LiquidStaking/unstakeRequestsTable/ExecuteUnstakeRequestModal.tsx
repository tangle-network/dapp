import { CheckboxCircleLine } from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TANGLE_DOCS_LIQUID_STAKING_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';

import ExternalLink from '../ExternalLink';
import ModalIcon from '../ModalIcon';

export type ExecuteUnstakeRequestModalProps = {
  lsPoolId: number | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const ExecuteUnstakeRequestModal: FC<ExecuteUnstakeRequestModalProps> = ({
  lsPoolId,
  isOpen,
  setIsOpen,
}) => {
  // TODO: Also not ready if the tx status is processing.
  const isReady = lsPoolId !== null;

  const handleConfirmClick = useCallback(() => {
    if (!isReady) {
      return;
    }

    // TODO: Execute unstake tx.
  }, [isReady]);

  const isProcessingTx = false;

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="w-full max-w-[calc(100vw-40px)] md:max-w-[500px]"
      >
        <ModalHeader onClose={() => setIsOpen(false)}>
          Cancel Unstake
        </ModalHeader>

        <div className="flex flex-col items-center justify-center gap-2 p-9">
          <ModalIcon Icon={CheckboxCircleLine} />

          <Typography
            className="dark:text-mono-0 text-center"
            variant="body1"
            fw="normal"
          >
            Are you sure you want to cancel your unstaking request? By
            cancelling, your tokens will remain staked and continue earning
            rewards.
          </Typography>

          <ExternalLink href={TANGLE_DOCS_LIQUID_STAKING_URL}>
            Learn More
          </ExternalLink>
        </div>

        <ModalFooter className="flex items-center gap-2">
          <Button
            onClick={() => setIsOpen(false)}
            isFullWidth
            variant="secondary"
            isDisabled={!isReady}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirmClick}
            isDisabled={!isReady}
            isFullWidth
            variant="primary"
            isLoading={isProcessingTx}
            loadingText="Processing"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExecuteUnstakeRequestModal;
