import { toSubstrateAddress } from '@webb-tools/webb-ui-components';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import toSubstrateBytes32Address from '@webb-tools/webb-ui-components/utils/toSubstrateBytes32Address';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import createEvmBatchCallData from '../../utils/staking/createEvmBatchCallData';

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
export const MAX_PAYOUTS_BATCH_SIZE = 30;

const usePayoutAllTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.BATCH, PayoutAllTxContext> =
    useCallback((context) => {
      const batchCalls = context.validatorEraPairs
        .slice(0, MAX_PAYOUTS_BATCH_SIZE)
        .map(({ validatorAddress, era }) => {
          // The precompile function expects a 32-byte address.
          const validatorEvmAddress32 =
            toSubstrateBytes32Address(validatorAddress);

          return createEvmBatchCallData(Precompile.STAKING, 'payoutStakers', [
            validatorEvmAddress32,
            era,
          ]);
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

  return useAgnosticTx<Precompile.BATCH, PayoutAllTxContext>({
    name: TxName.PAYOUT_ALL,
    precompile: Precompile.BATCH,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default usePayoutAllTx;
