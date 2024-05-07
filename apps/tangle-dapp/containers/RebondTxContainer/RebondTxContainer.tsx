'use client';

import { BN, BN_ZERO } from '@polkadot/util';
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
import useNetworkStore from '../../context/useNetworkStore';
import useTotalUnbondedAndUnbondingAmount from '../../data/NominatorStats/useTotalUnbondedAndUnbondingAmount';
import useUnbondingAmountSubscription from '../../data/NominatorStats/useUnbondingAmountSubscription';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import { rebondTokens as rebondTokensEvm } from '../../utils/evm';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';
import { rebondTokens as rebondTokensSubstrate } from '../../utils/polkadot';
import { RebondTxContainerProps } from './types';

const RebondTxContainer: FC<RebondTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const executeTx = useExecuteTxWithNotification();
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();

  const [amountToRebond, setAmountToRebond] = useState<BN | null>(null);
  const [isRebondTxLoading, setIsRebondTxLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const walletAddress = useActiveAccountAddress<string>('');

  const { data: unbondingAmountData, error: unbondingAmountError } =
    useUnbondingAmountSubscription();

  const { data: totalUnbondedAndUnbondingAmountData } =
    useTotalUnbondedAndUnbondingAmount(walletAddress);

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
      walletAddress.length > 0
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
      await executeTx(
        () => rebondTokensEvm(walletAddress, rebondAmount),
        () => rebondTokensSubstrate(rpcEndpoint, walletAddress, rebondAmount),
        `Successfully rebonded ${rebondAmount} ${nativeTokenSymbol}.`,
        'Failed to rebond tokens!'
      );

      closeModal();
    } catch {
      setIsRebondTxLoading(false);
    }
  }, [
    amountToRebond,
    closeModal,
    executeTx,
    rpcEndpoint,
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

        <div className="space-y-4 p-9">
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

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
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
