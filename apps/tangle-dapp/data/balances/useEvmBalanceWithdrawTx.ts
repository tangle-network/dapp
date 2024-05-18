import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { useCallback, useMemo } from 'react';

import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import useSubstrateTx from '../../hooks/useSubstrateTx';
import { toEvmAddress20 } from '../../utils';
import usePendingEvmBalance from './usePendingEvmBalance';

const useEvmBalanceWithdrawTx = () => {
  const pendingEvmBalance = usePendingEvmBalance();
  const { substrateAddress, isEvm } = useAgnosticAccountInfo();

  const evmAddress20 = useMemo(() => {
    // Only Substrate accounts can withdraw EVM balances.
    if (substrateAddress === null || isEvm) {
      return null;
    }

    return toEvmAddress20(substrateAddress);
  }, [isEvm, substrateAddress]);

  return useSubstrateTx(
    useCallback(
      (api) => {
        if (
          evmAddress20 === null ||
          pendingEvmBalance === null ||
          pendingEvmBalance === ZERO_BIG_INT
        ) {
          return null;
        }

        return api.tx.evm.withdraw(evmAddress20, pendingEvmBalance);
      },
      [evmAddress20, pendingEvmBalance]
    ),
    false
  );
};

export default useEvmBalanceWithdrawTx;
