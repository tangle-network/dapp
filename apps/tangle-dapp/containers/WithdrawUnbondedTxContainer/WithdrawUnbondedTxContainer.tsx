'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback, useMemo, useState } from 'react';

import { useTxConfirmationModal } from '../../context/TxConfirmationContext';
import useTotalUnbondedAndUnbondingAmount from '../../data/NominatorStats/useTotalUnbondedAndUnbondingAmount';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import { convertToSubstrateAddress } from '../../utils';
import { withdrawUnbondedTokens as withdrawUnbondedTokensEvm } from '../../utils/evm';
import { withdrawUnbondedTokens as withdrawUnbondedTokensSubstrate } from '../../utils/polkadot';
import { getSlashingSpans } from '../../utils/polkadot';
import { RebondTxContainer } from '../RebondTxContainer';
import { WithdrawUnbondedTxContainerProps } from './types';
import WithdrawUnbonded from './WithdrawUnbonded';

const WithdrawUnbondedTxContainer: FC<WithdrawUnbondedTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();

  const { setTxnConfirmationState } = useTxConfirmationModal();

  const [isRebondModalOpen, setIsRebondModalOpen] = useState(false);

  const [isWithdrawUnbondedTxLoading, setIsWithdrawUnbondedTxLoading] =
    useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    if (isSubstrateAddress(activeAccount?.address))
      return activeAccount.address;

    return convertToSubstrateAddress(activeAccount.address) ?? '';
  }, [activeAccount?.address]);

  const {
    data: totalUnbondedAndUnbondingAmountData,
    error: totalUnbondedAndUnbondingAmountError,
  } = useTotalUnbondedAndUnbondingAmount(substrateAddress);

  const totalUnbondedAmountAvailableToWithdraw = useMemo(() => {
    if (totalUnbondedAndUnbondingAmountError) {
      notificationApi({
        variant: 'error',
        message: totalUnbondedAndUnbondingAmountError.message,
      });
    }

    if (!totalUnbondedAndUnbondingAmountData?.value1?.unbonded) return NaN;

    return totalUnbondedAndUnbondingAmountData.value1.unbonded;
  }, [
    notificationApi,
    totalUnbondedAndUnbondingAmountData,
    totalUnbondedAndUnbondingAmountError,
  ]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return !isNaN(totalUnbondedAmountAvailableToWithdraw) &&
      totalUnbondedAmountAvailableToWithdraw > 0 &&
      walletAddress !== '0x0'
      ? true
      : false;
  }, [totalUnbondedAmountAvailableToWithdraw, walletAddress]);

  const closeModal = useCallback(() => {
    setIsWithdrawUnbondedTxLoading(false);
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsWithdrawUnbondedTxLoading(true);

    try {
      const hash = await executeTx(
        async () => {
          const slashingSpans = await getSlashingSpans(substrateAddress);
          return withdrawUnbondedTokensEvm(
            walletAddress,
            Number(slashingSpans)
          );
        },
        async () => {
          const slashingSpans = await getSlashingSpans(substrateAddress);
          return withdrawUnbondedTokensSubstrate(
            walletAddress,
            Number(slashingSpans)
          );
        },
        `Successfully withdraw!`,
        'Failed to withdraw tokens!'
      );

      setTxnConfirmationState({
        isOpen: true,
        status: 'success',
        hash,
        txnType: isSubstrateAddress(walletAddress) ? 'substrate' : 'evm',
      });
    } catch {
      setTxnConfirmationState({
        isOpen: true,
        status: 'error',
        hash: '',
        txnType: isSubstrateAddress(walletAddress) ? 'substrate' : 'evm',
      });
    } finally {
      closeModal();
    }
  }, [
    closeModal,
    executeTx,
    setTxnConfirmationState,
    substrateAddress,
    walletAddress,
  ]);

  const onRebondClick = () => {
    closeModal();
    setIsRebondModalOpen(true);
  };

  return (
    <>
      <Modal open>
        <ModalContent
          isCenter
          isOpen={isModalOpen}
          className="w-full max-w-[416px] rounded-2xl bg-mono-0 dark:bg-mono-180"
        >
          <ModalHeader titleVariant="h4" onClose={closeModal}>
            Withdraw Funds
          </ModalHeader>

          <div className="p-9">
            <WithdrawUnbonded
              unbondedAmount={
                totalUnbondedAndUnbondingAmountData?.value1?.unbonded ?? 0
              }
              unbondingAmount={
                totalUnbondedAndUnbondingAmountData?.value1?.unbonding ?? 0
              }
            />
          </div>

          <ModalFooter className="px-8 py-6 flex flex-col gap-1">
            <Button
              isFullWidth
              isDisabled={!continueToSignAndSubmitTx}
              isLoading={isWithdrawUnbondedTxLoading}
              onClick={submitAndSignTx}
            >
              Confirm
            </Button>

            <Button isFullWidth onClick={onRebondClick} variant="secondary">
              Rebond
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <RebondTxContainer
        isModalOpen={isRebondModalOpen}
        setIsModalOpen={setIsRebondModalOpen}
      />
    </>
  );
};

export default WithdrawUnbondedTxContainer;
