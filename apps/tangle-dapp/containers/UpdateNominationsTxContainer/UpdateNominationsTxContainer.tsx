'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Alert,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import { nominateValidators as nominateValidatorsEvm } from '../../utils/evm';
import { nominateValidators as nominateValidatorsSubstrate } from '../../utils/polkadot';
import SelectValidators from './SelectValidators';
import { UpdateNominationsTxContainerProps } from './types';

const UpdateNominationsTxContainer: FC<UpdateNominationsTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  currentNominations,
}) => {
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();
  const maxNominationQuota = useMaxNominationQuota();
  const { rpcEndpoint } = useNetworkStore();

  const [selectedValidators, setSelectedValidators] =
    useState(currentNominations);

  const [isSubmitAndSignTxLoading, setIsSubmitAndSignTxLoading] =
    useState(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  }, [activeAccount?.address]);

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

  const submitAndSignTx = useCallback(async () => {
    if (!isReadyToSubmitAndSignTx) {
      return;
    }

    setIsSubmitAndSignTxLoading(true);

    try {
      await executeTx(
        () => nominateValidatorsEvm(walletAddress, selectedValidators),
        () =>
          nominateValidatorsSubstrate(
            rpcEndpoint,
            walletAddress,
            selectedValidators
          ),
        `Successfully updated nominations!`,
        'Failed to update nominations!'
      );
      closeModal();
    } catch {
      setIsSubmitAndSignTxLoading(false);
    }
  }, [
    closeModal,
    executeTx,
    isReadyToSubmitAndSignTx,
    rpcEndpoint,
    selectedValidators,
    walletAddress,
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
