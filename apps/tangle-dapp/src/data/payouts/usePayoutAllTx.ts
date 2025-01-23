import { toSubstrateAddress } from '@webb-tools/webb-ui-components';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import convertAddressToBytes32 from '@webb-tools/webb-ui-components/utils/convertAddressToBytes32';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import createEvmBatchCall from '../../utils/staking/createEvmBatchCall';
import BATCH_PRECOMPILE_ABI from '../../abi/batch';
import STAKING_PRECOMPILE_ABI from '../../abi/staking';

export type PayoutAllTxContext = {
  validatorEraPairs: {
    validatorAddress: SubstrateAddress;
    era: number;
  }[];
};

// Limit the number of batch calls to avoid exceeding
// the block weight limit. This means that the user will need
// to click the `Payout All` button multiple times if there
// are more pending payouts. Use an optimistic count instead
// of calculating the exact tx weight, since there's always
// the possibility that other transactions are included in the
// same block, which would cause the batch payout to fail anyway.
export const MAX_PAYOUTS_BATCH_SIZE = 20;

const usePayoutAllTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof BATCH_PRECOMPILE_ABI,
    'batchAll',
    PayoutAllTxContext
  > = useCallback((context) => {
    const batchCalls = context.validatorEraPairs
      .slice(0, MAX_PAYOUTS_BATCH_SIZE)
      .map(({ validatorAddress, era }) => {
        // The precompile function expects a 32-byte address.
        const validatorEvmAddress32 = convertAddressToBytes32(validatorAddress);

        return createEvmBatchCall(
          STAKING_PRECOMPILE_ABI,
          PrecompileAddress.STAKING,
          'payoutStakers',
          [validatorEvmAddress32, era],
        );
      });

    return {
      functionName: 'batchAll',
      arguments: createEvmBatchCallArgs(batchCalls),
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<PayoutAllTxContext> =
    useCallback((api, _activeSubstrateAddress, context) => {
      const txs = context.validatorEraPairs
        .slice(0, MAX_PAYOUTS_BATCH_SIZE)
        .map(({ validatorAddress, era }) => {
          const validatorSubstrateAddress =
            toSubstrateAddress(validatorAddress);

          return api.tx.staking.payoutStakers(validatorSubstrateAddress, era);
        });

      return optimizeTxBatch(api, txs);
    }, []);

  return useAgnosticTx({
    name: TxName.PAYOUT_ALL,
    abi: BATCH_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.BATCH,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default usePayoutAllTx;
