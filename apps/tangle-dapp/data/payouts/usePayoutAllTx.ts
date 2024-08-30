import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
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

const usePayoutAllTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.BATCH, PayoutAllTxContext> =
    useCallback((context) => {
      const batchCalls = context.validatorEraPairs.map(
        ({ validatorSubstrateAddress, era }) => {
          // The precompile function expects a 32-byte address.
          const validatorEvmAddress32 = toEvmAddress32(
            validatorSubstrateAddress,
          );

          return createEvmBatchCallData(Precompile.STAKING, 'payoutStakers', [
            validatorEvmAddress32,
            era,
          ]);
        },
      );

      return {
        functionName: 'batchAll',
        arguments: createEvmBatchCallArgs(batchCalls),
      };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<PayoutAllTxContext> =
    useCallback((api, _activeSubstrateAddress, context) => {
      const txs = context.validatorEraPairs.map(
        ({ validatorSubstrateAddress: validatorAddress, era }) => {
          const validatorSubstrateAddress =
            toSubstrateAddress(validatorAddress);

          return api.tx.staking.payoutStakers(validatorSubstrateAddress, era);
        },
      );

      // TODO: Will need to split tx into multiple batch calls if there are too many, this is because it will otherwise fail with "1010: Invalid Transaction: Transaction would exhaust the block limits," due to the block weight limit.
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
