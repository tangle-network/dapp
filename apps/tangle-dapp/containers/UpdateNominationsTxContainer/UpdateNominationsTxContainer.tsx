'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isViemError } from '@webb-tools/web3-api-provider/src/utils';
import {
  Alert,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import { evmPublicClient, nominateValidators } from '../../constants';
import useAllValidatorsData from '../../hooks/useAllValidatorsData';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import SelectValidators from './SelectValidators';
import { UpdateNominationsTxContainerProps } from './types';

const UpdateNominationsTxContainer: FC<UpdateNominationsTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  currentNominations,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();

  const maxNominationQuota = useMaxNominationQuota();
  const allValidators = useAllValidatorsData();

  const [selectedValidators, setSelectedValidators] =
    useState<string[]>(currentNominations);
  const [isSubmitAndSignTxLoading, setIsSubmitAndSignTxLoading] =
    useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const isExceedingMaxNominationQuota = useMemo(() => {
    return selectedValidators.length > maxNominationQuota;
  }, [maxNominationQuota, selectedValidators.length]);

  const isReadyToSubmitAndSignTx = useMemo(() => {
    if (selectedValidators.length <= 0 || isExceedingMaxNominationQuota)
      return false;

    const sortedSelectedValidators = [...selectedValidators].sort();
    const sortedCurrentNominations = [...currentNominations].sort();

    const areArraysEqual =
      sortedSelectedValidators.length === sortedCurrentNominations.length &&
      sortedSelectedValidators.every(
        (val, index) => val === sortedCurrentNominations[index]
      );

    return !areArraysEqual;
  }, [currentNominations, isExceedingMaxNominationQuota, selectedValidators]);

  useEffect(() => {
    setSelectedValidators(currentNominations);
  }, [currentNominations]);

  const closeModal = useCallback(() => {
    setIsSubmitAndSignTxLoading(false);
    setIsModalOpen(false);
    setSelectedValidators(currentNominations);
  }, [currentNominations, setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsSubmitAndSignTxLoading(true);

    if (!isReadyToSubmitAndSignTx) return;

    try {
      const updateNominationsTxHash = await nominateValidators(
        walletAddress,
        selectedValidators
      );

      if (!updateNominationsTxHash) {
        throw new Error('Failed to update nominations!');
      }

      const updateNominationsTx =
        await evmPublicClient.waitForTransactionReceipt({
          hash: updateNominationsTxHash,
        });

      if (updateNominationsTx.status !== 'success') {
        throw new Error('Failed to update nominations!');
      }

      notificationApi({
        variant: 'success',
        message: `Successfully updated nominations!`,
      });
    } catch (error: any) {
      notificationApi({
        variant: 'error',
        message: isViemError(error)
          ? error.shortMessage
          : error.message || 'Something went wrong!',
      });
    } finally {
      closeModal();
    }
  }, [
    isReadyToSubmitAndSignTx,
    walletAddress,
    selectedValidators,
    notificationApi,
    closeModal,
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
            validators={allValidators}
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

        <ModalFooter className="px-8 py-6 flex flex-col gap-1">
          <Button
            isFullWidth
            isDisabled={!isReadyToSubmitAndSignTx}
            isLoading={isSubmitAndSignTxLoading}
            onClick={submitAndSignTx}
          >
            Sign & Submit
          </Button>

          <Button isFullWidth variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateNominationsTxContainer;
