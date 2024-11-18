import { CloseCircleLineIcon } from '@webb-tools/icons';
import {
  Modal,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  TANGLE_DOCS_LIQUID_STAKING_URL,
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
      <ModalContent onInteractOutside={onClose} isOpen={isOpen} size="md">
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

          <ExternalLink href={TANGLE_DOCS_LIQUID_STAKING_URL}>
            Learn More
          </ExternalLink>
        </div>

        <ModalFooterActions
          onClose={onClose}
          isProcessing={isProcessingTx}
          onConfirm={onConfirm}
        />
      </ModalContent>
    </Modal>
  );
};

export default CancelUnstakeModal;
