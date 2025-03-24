import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
} from '@tangle-network/ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@tangle-network/ui-components/constants';
import { type FC, useCallback, useState } from 'react';

import { PAYMENT_DESTINATION_OPTIONS } from '../../constants';
import useStakingRewardsDestination from '../../data/nomination/useStakingRewardsDestination';
import useSetPayeeTx from '../../data/staking/useSetPayeeTx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
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

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsModalOpen(true);
      } else {
        closeModalAndReset();
      }
    },
    [closeModalAndReset, setIsModalOpen],
  );

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
    <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
      <ModalContent size="md">
        <ModalHeader>Change Reward Destination</ModalHeader>

        <ModalBody>
          <UpdatePayee
            payeeOptions={PAYMENT_DESTINATION_OPTIONS}
            selectedPayee={selectedPayee}
            setSelectedPayee={setSelectedPayee}
          />
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_STAKING_URL}
          isProcessing={setPayeeTxStatus === TxStatus.PROCESSING}
          onConfirm={submitTx}
          isConfirmDisabled={!canSubmitTx}
        />
      </ModalContent>
    </Modal>
  );
};

export default UpdatePayeeTxContainer;
