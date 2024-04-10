'use client';

import RefundLineIcon from '@webb-tools/icons/RefundLineIcon';
import Spinner from '@webb-tools/icons/Spinner';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { FC, useCallback, useEffect } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import usePendingEVMBalance from '../../data/balances/usePendingEVMBalance';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { formatTokenBalance } from '../../utils/polkadot/tokens';
import ActionItem from './ActionItem';

type WithdrawEVMBalanceActionProps = ReturnType<typeof usePendingEVMBalance> & {
  balance: bigint;
};

const WithdrawEVMBalanceAction: FC<WithdrawEVMBalanceActionProps> = ({
  balance,
  execute,
  status,
  error,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();
  const { notificationApi } = useWebbUI();

  const handleWithdraw = useCallback(() => execute?.(), [execute]);

  const formattedBalance = formatTokenBalance(balance, nativeTokenSymbol);

  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      notificationApi({
        message: 'Withdraw successful',
        secondaryMessage: `You have successfully withdrawn ${formattedBalance}`,
        variant: 'success',
      });
    }

    if (status === TxStatus.ERROR) {
      notificationApi({
        message: `Withdraw failed`,
        secondaryMessage: error?.message ?? 'Failed to withdraw funds',
        variant: 'error',
      });
    }
  }, [error?.message, notificationApi, status, formattedBalance]);

  // If withdraw is successful, don't show the action item
  if (status === TxStatus.COMPLETE) {
    return null;
  }

  return (
    <ActionItem
      hasNotificationDot
      notificationDotVariant={status === TxStatus.ERROR ? 'error' : 'success'}
      label="Withdraw"
      Icon={
        status === TxStatus.PROCESSING
          ? () => <Spinner size="lg" />
          : RefundLineIcon
      }
      tooltip={
        status === TxStatus.ERROR ? (
          <>Oops, something went wrong. Please try again.</>
        ) : (
          <>You have {formattedBalance} to withdraw, click to withdraw.</>
        )
      }
      isDisabled={status === TxStatus.PROCESSING}
      onClick={handleWithdraw}
    />
  );
};

export default WithdrawEVMBalanceAction;
