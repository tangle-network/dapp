import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile, STAKING_INTERFACE } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { evmToSubstrateAddress, substrateToEvmAddress } from '../../utils';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import createEvmBatchCallData from '../../utils/staking/createEvmBatchCallData';

export type PayoutAllTxContext = {
  validatorEraPairs: { validatorAddress: string; era: number }[];
};

const usePayoutAllTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.BATCH, PayoutAllTxContext> =
    useCallback((context) => {
      const batchCalls = context.validatorEraPairs.map(
        ({ validatorAddress, era }) => {
          const validatorEvmAddress = substrateToEvmAddress(validatorAddress);

          return createEvmBatchCallData(
            Precompile.STAKING,
            STAKING_INTERFACE,
            'unbond',
            [validatorEvmAddress, era]
          );
        }
      );

      return {
        functionName: 'batchAll',
        arguments: createEvmBatchCallArgs(batchCalls),
      };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<PayoutAllTxContext> =
    useCallback((api, _activeSubstrateAddress, context) => {
      const txs = context.validatorEraPairs.map(({ validatorAddress, era }) => {
        const validatorSubstrateAddress =
          evmToSubstrateAddress(validatorAddress);

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
