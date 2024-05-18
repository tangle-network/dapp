'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import RefundLineIcon from '@webb-tools/icons/RefundLineIcon';
import Spinner from '@webb-tools/icons/Spinner';
import { FC, useCallback, useEffect, useMemo } from 'react';

import { TxName } from '../../constants';
import useNetworkStore from '../../context/useNetworkStore';
import useEvmBalanceWithdrawTx from '../../data/balances/useEvmBalanceWithdrawTx';
import usePendingEvmBalance from '../../data/balances/usePendingEvmBalance';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { TxStatus } from '../../hooks/useSubstrateTx';
import useTxNotification from '../../hooks/useTxNotification';
import { formatTokenBalance } from '../../utils/polkadot';
import ActionItem from './ActionItem';

const WithdrawEvmBalanceAction: FC = () => {
  const activeAccountAddress = useActiveAccountAddress();
  const { nativeTokenSymbol } = useNetworkStore();
  const { execute, status, error, txHash, reset } = useEvmBalanceWithdrawTx();
  const { notifyProcessing, notifySuccess, notifyError } = useTxNotification(
    TxName.WITHDRAW_EVM_BALANCE
  );

  const pendingEvmBalance = usePendingEvmBalance();

  const tokenAmountStr = useMemo(
    () =>
      pendingEvmBalance
        ? formatTokenBalance(pendingEvmBalance, nativeTokenSymbol)
        : null,
    [pendingEvmBalance, nativeTokenSymbol]
  );

  const handleWithdraw = useCallback(async () => {
    if (execute === null) {
      return;
    }
    notifyProcessing();

    await execute();
  }, [execute, notifyProcessing]);

  useEffect(() => {
    if (activeAccountAddress === null) {
      reset();
    }
  }, [activeAccountAddress, reset]);

  useEffect(() => {
    if (
      status === TxStatus.NOT_YET_INITIATED ||
      status === TxStatus.PROCESSING
    ) {
      return;
    }

    if (txHash !== null) {
      const successMessage = tokenAmountStr
        ? `Successfully withdrew ${tokenAmountStr}.`
        : null;
      notifySuccess(txHash, successMessage);
    } else if (error !== null) {
      notifyError(error);
    }
  }, [status, error, txHash, notifyError, notifySuccess, tokenAmountStr]);

  // If withdraw was successful, don't show the action item.
  if (status === TxStatus.COMPLETE) {
    return null;
  }
  // Nothing to withdraw or not available.
  else if (
    pendingEvmBalance === null ||
    pendingEvmBalance === ZERO_BIG_INT ||
    tokenAmountStr === null
  ) {
    return null;
  }

  return (
    <ActionItem
      hasNotificationDot
      notificationDotVariant={status === TxStatus.ERROR ? 'error' : 'success'}
      label="Withdraw"
      isDisabled={status === TxStatus.PROCESSING || execute === null}
      onClick={handleWithdraw}
      Icon={
        status === TxStatus.PROCESSING
          ? () => <Spinner size="lg" />
          : RefundLineIcon
      }
      tooltip={
        status === TxStatus.ERROR ? (
          <>Oops, something went wrong. Please try again.</>
        ) : (
          <>
            <strong>{tokenAmountStr}</strong> is available to withdraw. Use this
            action to release the funds.
          </>
        )
      }
    />
  );
};

export default WithdrawEvmBalanceAction;
