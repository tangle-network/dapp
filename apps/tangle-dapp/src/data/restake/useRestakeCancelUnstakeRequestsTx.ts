import { isEvmAddress } from '@webb-tools/webb-ui-components';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import convertAddressToBytes32 from '@webb-tools/webb-ui-components/utils/convertAddressToBytes32';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import {
  PrecompileAddress,
  ZERO_ADDRESS,
} from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import createEvmBatchCallData from '../../utils/staking/createEvmBatchCallData';
import BATCH_PRECOMPILE_ABI from '../../abi/batch';
import RESTAKING_PRECOMPILE_ABI from '../../abi/restaking';
import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';
import { BN } from '@polkadot/util';

type Context = {
  unstakeRequests: {
    operatorAddress: SubstrateAddress;
    assetId: RestakeAssetId;
    amount: BN;
  }[];
};

const useRestakeCancelUnstakeTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof BATCH_PRECOMPILE_ABI,
    'batchAll',
    Context
  > = useCallback((context) => {
    const batchCalls = context.unstakeRequests.map(
      ({ operatorAddress, assetId, amount }) => {
        const assetIdBigInt = isEvmAddress(assetId) ? 0 : BigInt(assetId);
        const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

        // The precompile function expects a 32-byte address.
        const operatorAddressBytes32 = convertAddressToBytes32(operatorAddress);

        return createEvmBatchCallData(
          RESTAKING_PRECOMPILE_ABI,
          PrecompileAddress.RESTAKING,
          'cancelDelegatorUnstake',
          [
            operatorAddressBytes32,
            assetIdBigInt,
            tokenAddress,
            BigInt(amount.toString()),
          ],
        );
      },
    );

    return {
      functionName: 'batchAll',
      arguments: createEvmBatchCallArgs(batchCalls),
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const txs = context.unstakeRequests.map(
        ({ operatorAddress, assetId, amount }) => {
          const assetIdEnum = isEvmAddress(assetId)
            ? { Erc20: assetId }
            : { Custom: new BN(assetId) };

          return api.tx.multiAssetDelegation.cancelDelegatorUnstake(
            operatorAddress,
            assetIdEnum,
            amount,
          );
        },
      );

      return optimizeTxBatch(api, txs);
    },
    [],
  );

  return useAgnosticTx({
    name: TxName.RESTAKE_CANCEL_UNSTAKE,
    abi: BATCH_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.BATCH,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useRestakeCancelUnstakeTx;
