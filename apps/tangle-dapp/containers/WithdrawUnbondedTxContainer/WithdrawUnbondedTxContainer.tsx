'use client';

import { BN_ZERO } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback, useMemo, useState } from 'react';

import { BondedTokensBalanceInfo } from '../../components/BondedTokensBalanceInfo';
import { useTxConfirmationModal } from '../../context/TxConfirmationContext';
import useNetworkStore from '../../context/useNetworkStore';
import useTotalUnbondedAndUnbondingAmount from '../../data/NominatorStats/useTotalUnbondedAndUnbondingAmount';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import { evmToSubstrateAddress } from '../../utils';
import { withdrawUnbondedTokens as withdrawUnbondedTokensEvm } from '../../utils/evm';
import { withdrawUnbondedTokens as withdrawUnbondedTokensSubstrate } from '../../utils/polkadot';
import { getSlashingSpans } from '../../utils/polkadot';
import { RebondTxContainer } from '../RebondTxContainer';
import { WithdrawUnbondedTxContainerProps } from './types';

const WithdrawUnbondedTxContainer: FC<WithdrawUnbondedTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();
  const { setTxConfirmationState } = useTxConfirmationModal();
  const [isRebondModalOpen, setIsRebondModalOpen] = useState(false);
  const { rpcEndpoint } = useNetworkStore();

  const [isWithdrawUnbondedTxLoading, setIsWithdrawUnbondedTxLoading] =
    useState(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    if (isSubstrateAddress(activeAccount?.address))
      return activeAccount.address;

    return evmToSubstrateAddress(activeAccount.address) ?? '';
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

    if (!totalUnbondedAndUnbondingAmountData?.value1?.unbonded)
      return undefined;

    return totalUnbondedAndUnbondingAmountData.value1.unbonded;
  }, [
    notificationApi,
    totalUnbondedAndUnbondingAmountData,
    totalUnbondedAndUnbondingAmountError,
  ]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return totalUnbondedAmountAvailableToWithdraw &&
      totalUnbondedAmountAvailableToWithdraw.gt(BN_ZERO) &&
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
          const slashingSpans = await getSlashingSpans(
            rpcEndpoint,
            substrateAddress
          );

          return withdrawUnbondedTokensEvm(
            walletAddress,
            Number(slashingSpans)
          );
        },
        async () => {
          const slashingSpans = await getSlashingSpans(
            rpcEndpoint,
            substrateAddress
          );

          return withdrawUnbondedTokensSubstrate(
            rpcEndpoint,
            walletAddress,
            Number(slashingSpans)
          );
        },
        `Successfully withdraw!`,
        'Failed to withdraw tokens!'
      );

      setTxConfirmationState({
        isOpen: true,
        status: 'success',
        hash,
        txType: isSubstrateAddress(walletAddress) ? 'substrate' : 'evm',
      });
    } catch {
      setTxConfirmationState({
        isOpen: true,
        status: 'error',
        hash: '',
        txType: isSubstrateAddress(walletAddress) ? 'substrate' : 'evm',
      });
    } finally {
      closeModal();
    }
  }, [
    closeModal,
    executeTx,
    rpcEndpoint,
    setTxConfirmationState,
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

          <div className="p-9 space-y-6">
            <Typography variant="body1" fw="normal">
              {`Upon successful withdrawal, the funds will be moved from the 'unbonded' state to your account's available balance.`}
            </Typography>

            <div className="flex flex-col gap-2">
              <BondedTokensBalanceInfo
                type="unbonded"
                value={
                  totalUnbondedAndUnbondingAmountData?.value1?.unbonded ??
                  BN_ZERO
                }
              />

              <BondedTokensBalanceInfo
                type="unbonding"
                value={
                  totalUnbondedAndUnbondingAmountData?.value1?.unbonding ??
                  BN_ZERO
                }
              />
            </div>
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
