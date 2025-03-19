import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
} from '@tangle-network/ui-components';
import { FC, useCallback, useEffect, useState } from 'react';

import { TxStatus } from '../../hooks/useSubstrateTx';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import useLsPoolUpdateNominationsTx from '../../data/liquidStaking/tangle/useLsPoolUpdateNominationsTx';
import SelectValidators from '../../containers/UpdateNominationsTxContainer/SelectValidators';

type Props = {
  poolId: number | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const LsUpdateNominationsModal: FC<Props> = ({ poolId, isOpen, setIsOpen }) => {
  const [validators, setValidators] = useState<Set<SubstrateAddress>>(
    new Set(),
  );

  const { execute, status } = useLsPoolUpdateNominationsTx();

  const isReady =
    poolId !== null &&
    execute !== null &&
    validators !== null &&
    status !== TxStatus.PROCESSING;

  const handleConfirmClick = useCallback(() => {
    if (!isReady) {
      return;
    }

    return execute({
      poolId,
      validators: Array.from(validators),
    });
  }, [isReady, execute, poolId, validators]);

  // Automatically close the modal if the transaction was successful.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      setIsOpen(false);
    }
  }, [setIsOpen, status]);

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="lg">
        <ModalHeader>Update Pool Nominations</ModalHeader>

        <ModalBody>
          <SelectValidators setSelectedValidators={setValidators} />
        </ModalBody>

        <ModalFooterActions
          hasCloseButton
          isProcessing={status === TxStatus.PROCESSING}
          onConfirm={handleConfirmClick}
          isConfirmDisabled={!isReady}
        />
      </ModalContent>
    </Modal>
  );
};

export default LsUpdateNominationsModal;
