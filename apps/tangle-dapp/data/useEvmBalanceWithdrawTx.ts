import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { useCallback } from 'react';

import useEvmAddress20 from '../hooks/useEvmAddress';
import useSubstrateTx from '../hooks/useSubstrateTx';
import usePendingEvmBalance from './balances/usePendingEvmBalance';

const useEvmBalanceWithdrawTx = () => {
  const pendingEvmBalance = usePendingEvmBalance();
  const evmAddress20 = useEvmAddress20();

  console.debug('evmAddress20', evmAddress20);
  console.debug('pendingEvmBalance', pendingEvmBalance);

  return useSubstrateTx(
    useCallback(
      (api) => {
        // No active EVM account or no balance to withdraw.
        if (
          evmAddress20 === null ||
          pendingEvmBalance === null ||
          pendingEvmBalance === ZERO_BIG_INT
        ) {
          console.debug('RETURNING NULL');
          return null;
        }

        return api.tx.evm.withdraw(evmAddress20, pendingEvmBalance);
      },
      [evmAddress20, pendingEvmBalance]
    )
  );
};

export default useEvmBalanceWithdrawTx;
