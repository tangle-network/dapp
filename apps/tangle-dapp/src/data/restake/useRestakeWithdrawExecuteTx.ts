import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { TxName } from '../../constants';
import RESTAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/restaking';
import { useCallback } from 'react';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

const useRestakeWithdrawExecuteTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof RESTAKING_PRECOMPILE_ABI,
    'executeWithdraw'
  > = useCallback(async () => {
    return {
      functionName: 'executeWithdraw',
      arguments: [],
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory = useCallback(async (api) => {
    if (!api) {
      return null;
    }

    return api.tx.multiAssetDelegation.executeWithdraw(null);
  }, []);

  return useAgnosticTx({
    name: TxName.RESTAKE_EXECUTE_WITHDRAW,
    precompileAddress: PrecompileAddress.RESTAKING,
    abi: RESTAKING_PRECOMPILE_ABI,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useRestakeWithdrawExecuteTx;
