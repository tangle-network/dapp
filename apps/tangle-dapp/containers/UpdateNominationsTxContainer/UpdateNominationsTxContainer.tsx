'use client';

import {
  Alert,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import useNominateTx from '../../data/staking/useNominateTx';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import SelectValidators from './SelectValidators';
import { UpdateNominationsTxContainerProps } from './types';

const UpdateNominationsTxContainer: FC<UpdateNominationsTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  currentNominations,
}) => {
  const maxNominationQuota = useMaxNominationQuota();

  const [selectedValidators, setSelectedValidators] =
    useState(currentNominations);

  const [isSubmitAndSignTxLoading, setIsSubmitAndSignTxLoading] =
    useState(false);

  const isExceedingMaxNominationQuota =
    selectedValidators.length > maxNominationQuota;

  const isReadyToSubmitAndSignTx = useMemo(() => {
    if (selectedValidators.length <= 0 || isExceedingMaxNominationQuota) {
      return false;
    }

    const sortedSelectedValidators = [...selectedValidators].sort();
    const sortedCurrentNominations = [...currentNominations].sort();

    const areArraysEqual =
      sortedSelectedValidators.length === sortedCurrentNominations.length &&
      sortedSelectedValidators.every(
        (val, index) => val === sortedCurrentNominations[index]
      );

    return !areArraysEqual;
  }, [currentNominations, isExceedingMaxNominationQuota, selectedValidators]);

  // Update the selected validators when the current
  // nominations prop changes.
  useEffect(() => {
    setSelectedValidators(currentNominations);
  }, [currentNominations]);

  const closeModal = useCallback(() => {
    setIsSubmitAndSignTxLoading(false);
    setIsModalOpen(false);
    setSelectedValidators(currentNominations);
  }, [currentNominations, setIsModalOpen]);

  const { execute: executeNominateTx } = useNominateTx();

  const submitAndSignTx = useCallback(async () => {
    if (!isReadyToSubmitAndSignTx || executeNominateTx === null) {
      return;
    }

    setIsSubmitAndSignTxLoading(true);

    try {
      await executeNominateTx({
        validatorAddresses: selectedValidators,
      });

      closeModal();
    } catch {
      setIsSubmitAndSignTxLoading(false);
    }
  }, [
    closeModal,
    executeNominateTx,
    isReadyToSubmitAndSignTx,
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
            selectedValidators={selectedValidators}
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
            isDisabled={!isReadyToSubmitAndSignTx}
            isLoading={isSubmitAndSignTxLoading}
            onClick={submitAndSignTx}
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
