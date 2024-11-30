import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/precompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { toSubstrateAddress } from '../../utils';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import createEvmBatchCallData from '../../utils/staking/createEvmBatchCallData';
import toEvmAddress32 from '../../utils/toEvmAddress32';

export type PayoutAllTxContext = {
  validatorEraPairs: { validatorSubstrateAddress: string; era: number }[];
};

// Limit the number of batch calls to avoid exceeding
// the block weight limit. This means that the user will need
// to click the `Payout All` button multiple times if there
// are more pending payouts. Use an optimistic count instead
// of calculating the exact tx weight, since there's always
// the possibility that other transactions are included in the
// same block, which would cause the batch payout to fail anyway.
export const MAX_PAYOUTS_BATCH_SIZE = 40;

const usePayoutAllTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.BATCH, PayoutAllTxContext> =
    useCallback((context) => {
      const batchCalls = context.validatorEraPairs
        .slice(0, MAX_PAYOUTS_BATCH_SIZE)
        .map(({ validatorSubstrateAddress, era }) => {
          // The precompile function expects a 32-byte address.
          const validatorEvmAddress32 = toEvmAddress32(
            validatorSubstrateAddress,
          );

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
        .map(({ validatorSubstrateAddress: validatorAddress, era }) => {
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
