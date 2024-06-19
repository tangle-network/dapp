'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import RefundLineIcon from '@webb-tools/icons/RefundLineIcon';
import Spinner from '@webb-tools/icons/Spinner';
import { FC, useCallback, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useEvmBalanceWithdrawTx from '../../data/balances/useEvmBalanceWithdrawTx';
import usePendingEvmBalance from '../../data/balances/usePendingEvmBalance';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import { TxStatus } from '../../hooks/useSubstrateTx';
import formatTangleBalance from '../../utils/formatTangleBalance';
import { toEvmAddress20 } from '../../utils/toEvmAddress20';
import ActionItem from './ActionItem';

const WithdrawEvmBalanceAction: FC = () => {
  const { nativeTokenSymbol } = useNetworkStore();
  const { substrateAddress, isEvm } = useAgnosticAccountInfo();
  const pendingEvmBalance = usePendingEvmBalance();

  const evmAddress20 = useMemo(() => {
    // Only Substrate accounts can withdraw EVM balances.
    if (substrateAddress === null || isEvm) {
      return null;
    }

    return toEvmAddress20(substrateAddress);
  }, [isEvm, substrateAddress]);

  const tokenAmountStr = useMemo(
    () =>
      pendingEvmBalance
        ? formatTangleBalance(pendingEvmBalance, nativeTokenSymbol)
        : null,
    [pendingEvmBalance, nativeTokenSymbol],
  );

  const { execute, status } = useEvmBalanceWithdrawTx(tokenAmountStr);

  const handleWithdraw = useCallback(async () => {
    await execute({
      pendingEvmBalance,
      evmAddress20,
    });
  }, [execute, pendingEvmBalance, evmAddress20]);

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
