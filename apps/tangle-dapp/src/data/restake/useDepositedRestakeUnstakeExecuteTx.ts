import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import RESTAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/restaking';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

type Context = void;

const useDepositedRestakeUnstakeExecuteTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'executeDelegatorUnstake',
    Context
  > = useCallback(() => {
    return {
      functionName: 'executeDelegatorUnstake',
      arguments: [],
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback((api) => {
    return api.tx.multiAssetDelegation.executeDelegatorUnstake();
  }, []);

  return useAgnosticTx({
    name: TxName.RESTAKE_DEPOSITED_UNSTAKE_EXECUTE,
    abi: RESTAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.RESTAKING,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useDepositedRestakeUnstakeExecuteTx;
