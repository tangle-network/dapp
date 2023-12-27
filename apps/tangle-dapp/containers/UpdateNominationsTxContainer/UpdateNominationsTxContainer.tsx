'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isViemError } from '@webb-tools/web3-api-provider/src/utils';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { evmPublicClient, nominateValidators } from '../../constants';
import { getActiveValidators } from '../../data';
import SelectValidators from './SelectValidators';
import { UpdateNominationsTxContainerProps } from './types';

const UpdateNominationsTxContainer: FC<UpdateNominationsTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  currentNominations,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const { data: activeValidatorsData } = useSWR(
    [getActiveValidators.name],
    ([, ...args]) => getActiveValidators(...args)
  );

  const [selectedValidators, setSelectedValidators] =
    useState<string[]>(currentNominations);
  const [isSubmitAndSignTxLoading, setIsSubmitAndSignTxLoading] =
    useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const isNewValidatorsSelected = useMemo(() => {
    if (selectedValidators.length <= 0) return false;

    const sortedSelectedValidators = [...selectedValidators].sort();
    const sortedCurrentNominations = [...currentNominations].sort();

    const areArraysEqual =
      sortedSelectedValidators.length === sortedCurrentNominations.length &&
      sortedSelectedValidators.every(
        (val, index) => val === sortedCurrentNominations[index]
      );

    return !areArraysEqual;
  }, [currentNominations, selectedValidators]);

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

    if (!isNewValidatorsSelected) return;

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
    isNewValidatorsSelected,
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
            validators={activeValidatorsData ? activeValidatorsData : []}
            selectedValidators={selectedValidators}
            setSelectedValidators={setSelectedValidators}
          />
        </div>

        <ModalFooter className="px-8 py-6 flex flex-col gap-1">
          <Button
            isFullWidth
            isDisabled={!isNewValidatorsSelected}
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
