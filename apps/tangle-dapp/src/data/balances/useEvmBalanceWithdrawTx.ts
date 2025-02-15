import type { HexString } from '@polkadot/util/types';
import { ZERO_BIG_INT } from '@tangle-network/dapp-config';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { useSubstrateTxWithNotification } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';

type Context = {
  pendingEvmBalance: bigint | null;
  evmAddress20: HexString | null;
};

const useEvmBalanceWithdrawTx = (tokenAmountStr?: string | null) => {
  const getSuccessMessage = useCallback<GetSuccessMessageFn<Context>>(
    () =>
      typeof tokenAmountStr === 'string'
        ? `Successfully withdrew ${tokenAmountStr}.`
        : '',
    [tokenAmountStr],
  );

  return useSubstrateTxWithNotification<Context>(
    TxName.WITHDRAW_EVM_BALANCE,
    useCallback((api, _, { pendingEvmBalance, evmAddress20 }) => {
      if (
        evmAddress20 === null ||
        pendingEvmBalance === null ||
        pendingEvmBalance === ZERO_BIG_INT
      ) {
        return null;
      }

      return api.tx.evm.withdraw(evmAddress20, pendingEvmBalance);
    }, []),
    getSuccessMessage,
  );
};

export default useEvmBalanceWithdrawTx;
