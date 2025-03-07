import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import RESTAKING_PRECOMPILE_ABI from '../../abi/restaking';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { convertAddressToBytes32 } from '@tangle-network/ui-components';
import BATCH_PRECOMPILE_ABI from '../../abi/batch';
import createEvmBatchCall from '../../utils/staking/createEvmBatchCall';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import optimizeTxBatch from '../../utils/optimizeTxBatch';

type Context = SubstrateAddress[];

const useNativeRestakeUnstakeExecuteTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof BATCH_PRECOMPILE_ABI,
    'batchAll',
    Context
  > = useCallback((context) => {
    const batchCalls = context.map((operatorAddress) => {
      return createEvmBatchCall(
        RESTAKING_PRECOMPILE_ABI,
        PrecompileAddress.RESTAKING,
        'executeDelegatorNominationUnstake',
        [convertAddressToBytes32(operatorAddress)],
      );
    });

    return {
      functionName: 'batchAll',
      arguments: createEvmBatchCallArgs(batchCalls),
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const txs = context.map((operatorAddress) => {
        return api.tx.multiAssetDelegation.executeNominationUnstake(
          operatorAddress,
        );
      });

      return optimizeTxBatch(api, txs);
    },
    [],
  );

  return useAgnosticTx({
    name: TxName.RESTAKE_NATIVE_UNSTAKE_EXECUTE,
    abi: BATCH_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.BATCH,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useNativeRestakeUnstakeExecuteTx;
