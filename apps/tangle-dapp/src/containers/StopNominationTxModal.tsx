import { ProhibitedLineIcon } from '@tangle-network/icons';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@tangle-network/webb-ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@tangle-network/webb-ui-components/constants';
import { type FC, useCallback } from 'react';

import useChillTx from '../data/staking/useChillTx';
import useIsNominating from '../hooks/useIsNominating';
import { TxStatus } from '../hooks/useSubstrateTx';

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

const StopNominationTxModal: FC<Props> = ({ isModalOpen, setIsModalOpen }) => {
  const { execute: executeChillTx, status: chillTxStatus } = useChillTx();
  const { isNominating } = useIsNominating();

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const submitTx = useCallback(async () => {
    if (executeChillTx === null) {
      return null;
    }

    await executeChillTx();
    closeModal();
  }, [closeModal, executeChillTx]);

  return (
    <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
      <ModalContent size="sm">
        <ModalHeader className="mb-4">Stop Nominations</ModalHeader>

        <ModalBody>
          <ProhibitedLineIcon className="m-auto fill-blue-50 dark:fill-blue-50" />

          <Typography variant="body1" className="mt-4 text-center">
            Are you sure you want to stop all staking activities? You will be
            removed from current validator nominations and cease rewards from
            the next era, your tokens will stay bonded.
          </Typography>
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_STAKING_URL}
          isProcessing={chillTxStatus === TxStatus.PROCESSING}
          isConfirmDisabled={isNominating === null || !isNominating}
          onConfirm={submitTx}
        />
      </ModalContent>
    </Modal>
  );
};

export default StopNominationTxModal;
