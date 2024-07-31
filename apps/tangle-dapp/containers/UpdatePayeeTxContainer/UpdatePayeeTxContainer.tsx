'use client';

import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useState } from 'react';

import { PAYMENT_DESTINATION_OPTIONS } from '../../constants';
import useStakingRewardsDestination from '../../data/NominatorStats/useStakingRewardsDestination';
import useSetPayeeTx from '../../data/staking/useSetPayeeTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { StakingRewardsDestination } from '../../types';
import { UpdatePayeeTxContainerProps } from './types';
import UpdatePayee from './UpdatePayee';

const UpdatePayeeTxContainer: FC<UpdatePayeeTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { result: currentPayee } = useStakingRewardsDestination();

  const [selectedPayee, setSelectedPayee] = useState(
    StakingRewardsDestination.STAKED,
  );

  const { execute: executeSetPayeeTx, status: setPayeeTxStatus } =
    useSetPayeeTx();

  const closeModalAndReset = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPayee(StakingRewardsDestination.STAKED);
  }, [setIsModalOpen]);

  const submitTx = useCallback(async () => {
    if (executeSetPayeeTx === null) {
      return;
    }

    await executeSetPayeeTx({
      payee: selectedPayee,
    });

    closeModalAndReset();
  }, [closeModalAndReset, executeSetPayeeTx, selectedPayee]);

  const canSubmitTx =
    currentPayee !== null &&
    currentPayee.value !== selectedPayee &&
    executeSetPayeeTx !== null;

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[416px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModalAndReset}>
          Change Reward Destination
        </ModalHeader>

        <div className="p-9">
          <UpdatePayee
            payeeOptions={PAYMENT_DESTINATION_OPTIONS}
            selectedPayee={selectedPayee}
            setSelectedPayee={setSelectedPayee}
          />
        </div>

        <ModalFooter className="px-8 py-6 flex items-center gap-2">
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
            isLoading={setPayeeTxStatus === TxStatus.PROCESSING}
            onClick={submitTx}
            isDisabled={!canSubmitTx}
            className="!m-0"
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdatePayeeTxContainer;
