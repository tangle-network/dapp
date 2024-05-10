'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import RefundLineIcon from '@webb-tools/icons/RefundLineIcon';
import Spinner from '@webb-tools/icons/Spinner';
import { FC, useCallback } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import usePendingEvmBalance from '../../data/balances/usePendingEvmBalance';
import useEvmBalanceWithdrawTx from '../../data/useEvmBalanceWithdrawTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { formatTokenBalance } from '../../utils/polkadot';
import ActionItem from './ActionItem';

const WithdrawEvmBalanceAction: FC = () => {
  const { nativeTokenSymbol } = useNetworkStore();
  const { execute, status } = useEvmBalanceWithdrawTx();

  const pendingEvmBalance = usePendingEvmBalance();

  const handleWithdraw = useCallback(() => {
    if (execute === null) {
      return;
    }

    execute();
  }, [execute]);

  // TODO: Notify user using tx toast.

  // If withdraw is successful, don't show the action item
  if (status === TxStatus.COMPLETE) {
    return null;
  }

  if (pendingEvmBalance === null || pendingEvmBalance === ZERO_BIG_INT) {
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
            There is {formatTokenBalance(pendingEvmBalance, nativeTokenSymbol)}{' '}
            available to withdraw. Use this action to release the funds.
          </>
        )
      }
    />
  );
};

export default WithdrawEvmBalanceAction;
