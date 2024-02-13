'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
import {
  Alert,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import { TxnConfirmationCard } from '../../components/TxnConfirmationCard';
import useAllValidatorsData from '../../hooks/useAllValidatorsData';
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

  const [txnConfirmationCardIsOpen, setTxnConfirmationCardIsOpen] =
    useState(false);
  const [txnStatus, setTxnStatus] = useState<{
    status: 'success' | 'error';
    hash: string;
  }>({
    status: 'error',
    hash: '',
  });

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
    if (!isReadyToSubmitAndSignTx) return;

    setIsSubmitAndSignTxLoading(true);

    try {
      const hash = await executeTx(
        () => nominateValidatorsEvm(walletAddress, selectedValidators),
        () => nominateValidatorsSubstrate(walletAddress, selectedValidators),
        `Successfully updated nominations!`,
        'Failed to update nominations!'
      );

      setTxnStatus({ status: 'success', hash });
      setTxnConfirmationCardIsOpen(true);
    } catch {
      setTxnStatus({ status: 'error', hash: '' });
      setTxnConfirmationCardIsOpen(true);
    } finally {
      closeModal();
    }
  }, [
    isReadyToSubmitAndSignTx,
    executeTx,
    walletAddress,
    selectedValidators,
    closeModal,
  ]);

  return (
    <>
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

      <TxnConfirmationCard
        isModalOpen={txnConfirmationCardIsOpen}
        setIsModalOpen={setTxnConfirmationCardIsOpen}
        txnStatus={txnStatus.status}
        txnHash={txnStatus.hash}
        txnType={isSubstrateAddress(walletAddress) ? 'substrate' : 'evm'}
      />
    </>
  );
};

export default UpdateNominationsTxContainer;
