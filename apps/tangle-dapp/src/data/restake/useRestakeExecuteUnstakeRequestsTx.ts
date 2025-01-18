import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import RESTAKING_PRECOMPILE_ABI from '../../abi/restaking';

const useRestakeExecuteUnstakeRequestsTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'executeDelegatorUnstake'
  > = useCallback(
    () => ({
      functionName: 'executeDelegatorUnstake',
      arguments: [],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory = useCallback((api) => {
    return api.tx.multiAssetDelegation.executeDelegatorUnstake();
  }, []);

  return useAgnosticTx({
    name: TxName.RESTAKE_EXECUTE_UNSTAKE,
    abi: RESTAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.RESTAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useRestakeExecuteUnstakeRequestsTx;
