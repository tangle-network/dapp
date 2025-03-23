import { ZERO_BIG_INT } from '@tangle-network/dapp-config';
import RefundLineIcon from '@tangle-network/icons/RefundLineIcon';
import Spinner from '@tangle-network/icons/Spinner';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { toEvmAddress } from '@tangle-network/ui-components';
import { FC, useCallback, useMemo } from 'react';

import useEvmBalanceWithdrawTx from '../../data/balances/useEvmBalanceWithdrawTx';
import usePendingEvmBalance from '../../data/balances/usePendingEvmBalance';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import formatTangleBalance from '../../utils/formatTangleBalance';
import ActionItem from './ActionItem';
import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';

const WithdrawEvmBalanceAction: FC = () => {
  const { nativeTokenSymbol } = useNetworkStore();
  const { substrateAddress, isEvm } = useAgnosticAccountInfo();
  const pendingEvmBalance = usePendingEvmBalance();

  const evmAddress20 = useMemo(() => {
    // Only Substrate accounts can withdraw EVM balances.
    if (substrateAddress === null || isEvm) {
      return null;
    }

    return toEvmAddress(substrateAddress);
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
    if (execute === null) {
      return;
    }

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
