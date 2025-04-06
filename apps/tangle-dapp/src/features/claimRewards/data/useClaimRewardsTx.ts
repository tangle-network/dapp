import { ZERO_BIG_INT } from '@tangle-network/dapp-config/constants';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import { useCallback } from 'react';
import { zeroAddress } from 'viem';
import BATCH_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/batch';
import REWARDS_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/rewards';
import { TxName } from '../../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import createEvmBatchCall from '../../../utils/staking/createEvmBatchCall';
import createEvmBatchCallArgs from '../../../utils/staking/createEvmBatchCallArgs';
import optimizeTxBatch from '@tangle-network/tangle-shared-ui/utils/optimizeTxBatch';
import { SUCCESS_MESSAGES } from '../../../hooks/useTxNotification';

type Context = {
  assetIds: RestakeAssetId[];
};

const useClaimRewardsTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof BATCH_PRECOMPILE_ABI,
    'batchAll',
    Context
  > = useCallback((context) => {
    if (context.assetIds.length === 0) {
      return null;
    }

    const batchCalls = context.assetIds.map((assetId) => {
      const args = isEvmAddress(assetId)
        ? ([ZERO_BIG_INT, assetId] as const)
        : ([BigInt(assetId), zeroAddress as EvmAddress] as const);

      return createEvmBatchCall(
        REWARDS_PRECOMPILE_ABI,
        PrecompileAddress.REWARDS,
        'claimRewards',
        args,
      );
    });

    return {
      functionName: 'batchAll',
      arguments: createEvmBatchCallArgs(batchCalls),
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      if (context.assetIds.length === 0) {
        return null;
      }

      const txes = context.assetIds.map((assetId) => {
        const args = isEvmAddress(assetId)
          ? ({ Erc20: assetId } as const)
          : ({ Custom: BigInt(assetId) } as const);

        return api.tx.rewards.claimRewards(args);
      });

      return optimizeTxBatch(api, txes);
    },
    [],
  );

  return useAgnosticTx({
    name: TxName.CLAIM_REWARDS,
    abi: BATCH_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.BATCH,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useClaimRewardsTx;
