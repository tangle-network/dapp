import {
  PrecompileAddress,
  ZERO_ADDRESS,
} from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { TxName } from '../../constants';
import RESTAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/restaking';
import BATCH_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/batch';
import { useCallback } from 'react';
import { BN } from '@polkadot/util';
import optimizeTxBatch from '@tangle-network/tangle-shared-ui/utils/optimizeTxBatch';
import createEvmBatchCall from '../../utils/staking/createEvmBatchCall';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import { isEvmAddress, assertEvmAddress } from '@tangle-network/ui-components';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

type CancelWithdrawRequest = {
  amount: BN;
  assetId: string;
};

const useRestakeWithdrawCancelTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof BATCH_PRECOMPILE_ABI,
    'batchAll',
    CancelWithdrawRequest[]
  > = useCallback(async (requests: CancelWithdrawRequest[]) => {
    const batchCalls = requests.map(({ assetId, amount }) => {
      const assetIdBigInt = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);
      const tokenAddress = isEvmAddress(assetId)
        ? assertEvmAddress(assetId)
        : ZERO_ADDRESS;

      return createEvmBatchCall(
        RESTAKING_PRECOMPILE_ABI,
        PrecompileAddress.RESTAKING,
        'cancelWithdraw',
        [assetIdBigInt, tokenAddress, BigInt(amount.toString())],
      );
    });

    return {
      functionName: 'batchAll',
      arguments: createEvmBatchCallArgs(batchCalls),
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<CancelWithdrawRequest[]> =
    useCallback(async (api, _activeAddress, requests) => {
      if (!api) {
        return null;
      }

      const batch = requests.map(({ assetId, amount }) => {
        const assetIdEnum = isEvmAddress(assetId)
          ? { Erc20: assetId }
          : { Custom: new BN(assetId) };

        return api.tx.multiAssetDelegation.cancelWithdraw(assetIdEnum, amount);
      });

      return optimizeTxBatch(api, batch);
    }, []);

  return useAgnosticTx({
    name: TxName.RESTAKE_CANCEL_WITHDRAW,
    precompileAddress: PrecompileAddress.BATCH,
    abi: BATCH_PRECOMPILE_ABI,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useRestakeWithdrawCancelTx;
