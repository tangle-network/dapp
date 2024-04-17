import { useCallback } from 'react';
import { padHex } from 'viem';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
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

          // Pad the address to 32 bytes, since the function expects a 32-byte
          // address.
          const validatorEvmAddress32 = padHex(validatorEvmAddress, {
            size: 32,
          });

          return createEvmBatchCallData(Precompile.STAKING, 'payoutStakers', [
            validatorEvmAddress32,
            era,
          ]);
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
