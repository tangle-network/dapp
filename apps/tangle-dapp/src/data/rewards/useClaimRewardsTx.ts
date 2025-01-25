import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { isEvmAddress } from '@webb-tools/webb-ui-components/utils/isEvmAddress20';
import { useCallback } from 'react';
import { zeroAddress } from 'viem';
import BATCH_PRECOMPILE_ABI from '../../abi/batch';
import REWARDS_PRECOMPILE_ABI from '../../abi/rewards';
import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import createEvmBatchCall from '../../utils/staking/createEvmBatchCall';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';

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
  });
};

export default useClaimRewardsTx;
