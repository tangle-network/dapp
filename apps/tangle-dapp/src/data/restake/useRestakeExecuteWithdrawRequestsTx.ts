import { useCallback } from 'react';

import { TxName } from '../../constants';
import {
  PrecompileAddress,
  ZERO_ADDRESS,
} from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import RESTAKING_PRECOMPILE_ABI from '../../abi/restaking';

const useRestakeExecuteWithdrawRequestsTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'executeWithdraw'
  > = useCallback(
    () => ({
      functionName: 'executeWithdraw',
      arguments: [],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory = useCallback((api) => {
    // TODO: Figure out what the EVM address param is for.
    return api.tx.multiAssetDelegation.executeWithdraw(ZERO_ADDRESS);
  }, []);

  return useAgnosticTx({
    name: TxName.RESTAKE_EXECUTE_WITHDRAW,
    abi: RESTAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.RESTAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useRestakeExecuteWithdrawRequestsTx;
