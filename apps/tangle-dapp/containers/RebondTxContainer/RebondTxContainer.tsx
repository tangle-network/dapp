'use client';

import { BN, BN_ZERO } from '@polkadot/util';
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
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { type FC, useCallback, useMemo, useState } from 'react';

import { BondedTokensBalanceInfo } from '../../components';
import AmountInput from '../../components/AmountInput/AmountInput';
import { useTxConfirmationModal } from '../../context/TxConfirmationContext';
import useNetworkStore from '../../context/useNetworkStore';
import useTotalUnbondedAndUnbondingAmount from '../../data/NominatorStats/useTotalUnbondedAndUnbondingAmount';
import useUnbondingAmountSubscription from '../../data/NominatorStats/useUnbondingAmountSubscription';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import { evmToSubstrateAddress } from '../../utils';
import { rebondTokens as rebondTokensEvm } from '../../utils/evm';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';
import { rebondTokens as rebondTokensSubstrate } from '../../utils/polkadot';
import { RebondTxContainerProps } from './types';

const RebondTxContainer: FC<RebondTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();
  const { setTxConfirmationState } = useTxConfirmationModal();
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();

  const [amountToRebond, setAmountToRebond] = useState<BN | null>(null);
  const [isRebondTxLoading, setIsRebondTxLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '';
    }

    if (isSubstrateAddress(activeAccount?.address))
      return activeAccount.address;

    return evmToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const { data: unbondingAmountData, error: unbondingAmountError } =
    useUnbondingAmountSubscription(substrateAddress);

  const { data: totalUnbondedAndUnbondingAmountData } =
    useTotalUnbondedAndUnbondingAmount(substrateAddress);

  const remainingUnbondedTokensToRebond = useMemo(() => {
    if (unbondingAmountError) {
      notificationApi({
        variant: 'error',
        message: unbondingAmountError.message,
      });
    }

    return unbondingAmountData?.value1 ?? undefined;
  }, [notificationApi, unbondingAmountData?.value1, unbondingAmountError]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return (
      amountToRebond !== null &&
      amountToRebond.gt(BN_ZERO) &&
      !hasErrors &&
      walletAddress !== '0x0'
    );
  }, [amountToRebond, hasErrors, walletAddress]);

  const closeModal = useCallback(() => {
    setIsRebondTxLoading(false);
    setIsModalOpen(false);
    setAmountToRebond(null);
    setHasErrors(false);
  }, [setIsModalOpen]);

  const handleSetErrorMessage = useCallback(
    (error: string | null) => {
      setHasErrors(error !== null);
    },
    [setHasErrors]
  );

  const submitAndSignTx = useCallback(async () => {
    setIsRebondTxLoading(true);

    try {
      if (amountToRebond === null || amountToRebond.eq(BN_ZERO)) {
        throw new Error('There is no amount to rebond.');
      }
      const rebondAmount = +formatBnToDisplayAmount(amountToRebond);
      const hash = await executeTx(
        () => rebondTokensEvm(walletAddress, rebondAmount),
        () => rebondTokensSubstrate(rpcEndpoint, walletAddress, rebondAmount),
        `Successfully rebonded ${rebondAmount} ${nativeTokenSymbol}.`,
        'Failed to rebond tokens!'
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
    amountToRebond,
    closeModal,
    executeTx,
    rpcEndpoint,
    setTxConfirmationState,
    walletAddress,
    nativeTokenSymbol,
  ]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[416px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Rebond Funds
        </ModalHeader>

        <div className="p-9 space-y-4">
          <Typography variant="body1" fw="normal">
            Rebond to return unbonding or unbonded tokens to staking without
            withdrawing.
          </Typography>

          <AmountInput
            id="rebond-input"
            title="Amount"
            max={remainingUnbondedTokensToRebond}
            amount={amountToRebond}
            setAmount={setAmountToRebond}
            baseInputOverrides={{ isFullWidth: true }}
            maxErrorMessage="Not enough unbonding balance"
            setErrorMessage={handleSetErrorMessage}
            isDisabled={isRebondTxLoading}
          />

          <div className="space-y-2">
            <BondedTokensBalanceInfo
              type="unbonded"
              value={
                totalUnbondedAndUnbondingAmountData?.value1?.unbonded ?? BN_ZERO
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
            isLoading={isRebondTxLoading}
            onClick={submitAndSignTx}
          >
            Confirm
          </Button>

          <Link href={WEBB_TANGLE_DOCS_STAKING_URL} target="_blank">
            <Button isFullWidth variant="secondary">
              Learn More
            </Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RebondTxContainer;
