import { CloseCircleLineIcon } from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TANGLE_DOCS_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useEffect } from 'react';

import { TxStatus } from '../../../hooks/useSubstrateTx';
import ExternalLink from '../ExternalLink';
import ModalIcon from '../ModalIcon';

export type CancelUnstakeModalProps = {
  txStatus: TxStatus;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const CancelUnstakeModal: FC<CancelUnstakeModalProps> = ({
  isOpen,
  txStatus,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    // Automatically close the modal when the transaction is successful.
    if (txStatus === TxStatus.COMPLETE) {
      onClose();
    }
  }, [onClose, txStatus]);

  const isProcessingTx = txStatus === TxStatus.PROCESSING;

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="w-full max-w-[calc(100vw-40px)] md:max-w-[500px]"
      >
        <ModalHeader onClose={onClose}>Cancel Unstake</ModalHeader>

        <div className="flex flex-col items-center justify-center gap-2 p-9">
          <ModalIcon Icon={CloseCircleLineIcon} />

          <Typography
            className="dark:text-mono-0 text-center"
            variant="body1"
            fw="normal"
          >
            Are you sure you want to cancel your unstaking request? By
            cancelling, your tokens will remain staked and continue earning
            rewards.
          </Typography>

          <ExternalLink href={TANGLE_DOCS_URL}>Learn More</ExternalLink>
        </div>

        <ModalFooter className="flex items-center gap-2">
          <Button
            onClick={onClose}
            isFullWidth
            variant="secondary"
            isDisabled={isProcessingTx}
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
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

export default CancelUnstakeModal;
