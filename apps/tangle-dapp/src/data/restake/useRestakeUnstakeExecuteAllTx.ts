import { useCallback } from 'react';
import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import BATCH_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/batch';
import RESTAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/restaking';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { convertAddressToBytes32 } from '@tangle-network/ui-components';
import createEvmBatchCall from '../../utils/staking/createEvmBatchCall';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import optimizeTxBatch from '@tangle-network/tangle-shared-ui/utils/optimizeTxBatch';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

type Context = {
  nominatedOperators: SubstrateAddress[];
  hasDepositedRequests: boolean;
  hasNonNativeRequests: boolean;
};

const useRestakeUnstakeExecuteAllTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof BATCH_PRECOMPILE_ABI,
    'batchAll',
    Context
  > = useCallback((context) => {
    const batchCalls = [];

    context.nominatedOperators.forEach((operatorAddress) => {
      batchCalls.push(
        createEvmBatchCall(
          RESTAKING_PRECOMPILE_ABI,
          PrecompileAddress.RESTAKING,
          'executeDelegatorNominationUnstake',
          [convertAddressToBytes32(operatorAddress)],
        ),
      );
    });

    if (context.hasDepositedRequests) {
      batchCalls.push(
        createEvmBatchCall(
          RESTAKING_PRECOMPILE_ABI,
          PrecompileAddress.RESTAKING,
          'executeDelegatorUnstake',
          [],
        ),
      );
    }

    if (context.hasNonNativeRequests) {
      batchCalls.push(
        createEvmBatchCall(
          RESTAKING_PRECOMPILE_ABI,
          PrecompileAddress.RESTAKING,
          'executeDelegatorUnstake',
          [],
        ),
      );
    }

    return {
      functionName: 'batchAll',
      arguments: createEvmBatchCallArgs(batchCalls),
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const txs = [];

      context.nominatedOperators.forEach((operatorAddress) => {
        txs.push(
          api.tx.multiAssetDelegation.executeNominationUnstake(operatorAddress),
        );
      });

      if (context.hasDepositedRequests || context.hasNonNativeRequests) {
        txs.push(api.tx.multiAssetDelegation.executeDelegatorUnstake());
      }

      return optimizeTxBatch(api, txs);
    },
    [],
  );

  return useAgnosticTx({
    name: TxName.RESTAKE_UNSTAKE_EXECUTE_ALL,
    abi: BATCH_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.BATCH,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useRestakeUnstakeExecuteAllTx;
