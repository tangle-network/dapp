'use client';

import { ProhibitedLineIcon } from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback } from 'react';

import useChillTx from '../../data/staking/useChillTx';
import useIsNominating from '../../hooks/useIsNominating';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { StopNominationTxContainerProps } from './types';

const StopNominationTxContainer: FC<StopNominationTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
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
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[416px]"
      >
        <ModalHeader onClose={closeModal} className="mb-4">
          Stop Nominations
        </ModalHeader>

        <div className="block m-auto p-9">
          <ProhibitedLineIcon className="m-auto fill-blue-50 dark:fill-blue-50" />

          <Typography variant="body1" className="mt-4 text-center">
            Are you sure you want to stop all staking activities? You will be
            removed from current validator nominations and cease rewards from
            the next era, your tokens will stay bonded.
          </Typography>
        </div>

        <ModalFooter className="flex items-center gap-2">
          <Button
            isFullWidth
            variant="secondary"
            href={TANGLE_DOCS_STAKING_URL}
            target="_blank"
          >
            Learn More
          </Button>

          <Button
            isFullWidth
            isDisabled={isNominating === null || !isNominating}
            isLoading={chillTxStatus === TxStatus.PROCESSING}
            onClick={submitTx}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StopNominationTxContainer;
