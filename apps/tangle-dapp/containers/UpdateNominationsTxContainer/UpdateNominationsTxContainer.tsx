'use client';

import {
  Alert,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import _ from 'lodash';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import useNominateTx from '../../data/staking/useNominateTx';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import { TxStatus } from '../../hooks/useSubstrateTx';
import SelectValidators from './SelectValidators';

export type UpdateNominationsTxContainerProps = {
  isModalOpen: boolean;
  currentNominations: string[] | null;
  setIsModalOpen: (isModalOpen: boolean) => void;
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
      !_.isEqual(currentNominations, selectedValidators) &&
      executeNominateTx !== null
    );
  }, [
    currentNominations,
    executeNominateTx,
    isExceedingMaxNominationQuota,
    selectedValidators,
  ]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[1000px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Update Nominations
        </ModalHeader>

        <div className="px-8 py-6">
          <SelectValidators
            // TODO: Pass the `| null` explicitly, and handle the case where it is `null` at the lowest level.
            selectedValidators={selectedValidators ?? []}
            setSelectedValidators={setSelectedValidators}
          />

          {isExceedingMaxNominationQuota && (
            <Alert
              type="error"
              className="mt-4"
              description={`You can only nominate up to ${maxNominationQuota} validators.`}
            />
          )}
        </div>

        <ModalFooter className="flex gap-1 items-center">
          <Button isFullWidth variant="secondary" onClick={closeModal}>
            Cancel
          </Button>

          <Button
            isFullWidth
            isDisabled={!canSubmitTx}
            isLoading={nominateTxStatus === TxStatus.PROCESSING}
            onClick={submitTx}
            className="!mt-0"
          >
            Confirm Nomination
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateNominationsTxContainer;
