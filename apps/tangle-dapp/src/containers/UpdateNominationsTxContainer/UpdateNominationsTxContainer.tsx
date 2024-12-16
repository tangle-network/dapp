import {
  Alert,
  Modal,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import isEqual from 'lodash/isEqual';
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import useNominateTx from '../../data/staking/useNominateTx';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import { TxStatus } from '../../hooks/useSubstrateTx';
import SelectValidators from './SelectValidators';

export type UpdateNominationsTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  currentNominations: SubstrateAddress[];
};

const UpdateNominationsTxContainer: FC<UpdateNominationsTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  currentNominations,
}) => {
  const maxNominationQuota = useMaxNominationQuota();

  const { execute: executeNominateTx, status: nominateTxStatus } =
    useNominateTx();

  const [selectedValidators, setSelectedValidators] =
    useState(currentNominations);

  // Cannot nominate more than a certain number of validators.
  const isExceedingMaxNominationQuota =
    selectedValidators !== null &&
    selectedValidators.length > maxNominationQuota;

  // Update the selected validators when the current
  // nominations prop changes.
  useEffect(() => {
    setSelectedValidators(currentNominations);
  }, [currentNominations]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedValidators(currentNominations);
  }, [currentNominations, setIsModalOpen]);

  const submitTx = useCallback(async () => {
    if (executeNominateTx === null || selectedValidators === null) {
      return;
    }

    await executeNominateTx({
      validatorAddresses: selectedValidators,
    });

    closeModal();
  }, [closeModal, executeNominateTx, selectedValidators]);

  const canSubmitTx = useMemo(() => {
    if (
      selectedValidators === null ||
      selectedValidators.length === 0 ||
      isExceedingMaxNominationQuota
    ) {
      return false;
    }

    // Can only submit transaction if the selected validators differ
    // from the current nominations.
    return (
      !isEqual(currentNominations, selectedValidators) &&
      executeNominateTx !== null
    );
  }, [
    currentNominations,
    executeNominateTx,
    isExceedingMaxNominationQuota,
    selectedValidators,
  ]);

  // The outer selected validators state is array of string
  // but the child select validators state is set of string
  // so we need to handle the conversion between set <> array
  const handleSelectedValidatorsChange = useCallback<
    Dispatch<SetStateAction<Set<SubstrateAddress>>>
  >(
    (nextValueOrUpdater) => {
      if (typeof nextValueOrUpdater === 'function') {
        setSelectedValidators((prev) => {
          return Array.from(nextValueOrUpdater(new Set(prev)));
        });
      } else {
        setSelectedValidators(Array.from(nextValueOrUpdater));
      }
    },
    [setSelectedValidators],
  );

  return (
    <Modal open>
      <ModalContent
        onInteractOutside={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        size="lg"
      >
        <ModalHeader onClose={closeModal}>Update Nominations</ModalHeader>

        <div className="px-8 py-6">
          <SelectValidators
            defaultSelectedValidators={currentNominations}
            setSelectedValidators={handleSelectedValidatorsChange}
          />

          {isExceedingMaxNominationQuota && (
            <Alert
              type="error"
              className="mt-4"
              description={`You can only nominate up to ${maxNominationQuota} validators.`}
            />
          )}
        </div>

        <ModalFooterActions
          onClose={closeModal}
          isProcessing={nominateTxStatus === TxStatus.PROCESSING}
          isConfirmDisabled={!canSubmitTx}
          onConfirm={submitTx}
        />
      </ModalContent>
    </Modal>
  );
};

export default UpdateNominationsTxContainer;
