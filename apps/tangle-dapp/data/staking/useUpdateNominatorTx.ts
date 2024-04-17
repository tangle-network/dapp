import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import {
  AbiBatchCallData,
  EvmTxFactory,
} from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import createEvmBatchCallData from '../../utils/staking/createEvmBatchCallData';
import getEvmPayeeValue from '../../utils/staking/getEvmPayeeValue';
import getSubstratePayeeValue from '../../utils/staking/getSubstratePayeeValue';
import toEvmAddress32 from '../../utils/toEvmAddress32';
import { NominationOptions } from './useSetupNominatorTx';

export type UpdateNominatorOptions = Partial<NominationOptions> & {
  nominees: string[];
};

const useUpdateNominatorTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.BATCH, UpdateNominatorOptions> =
    useCallback((context) => {
      const batchCalls: AbiBatchCallData[] = [];

      // If payee was provided, add the call to set the payee.
      if (context.payee !== undefined) {
        const payee = getEvmPayeeValue(context.payee);

        // TODO: Are we missing adding all the EVM addresses for the other reward destinations?
        if (payee === null) {
          throw new Error(
            'There is no EVM destination address registered for the given payee'
          );
        }

        batchCalls.push(
          createEvmBatchCallData(Precompile.STAKING, 'setPayee', [payee])
        );
      }

      // If a bond amount was provided, add the call to bond extra.
      if (context.bondAmount !== undefined) {
        batchCalls.push(
          createEvmBatchCallData(Precompile.STAKING, 'bondExtra', [
            BigInt(context.bondAmount.toString()),
          ])
        );
      }

      const evmNomineeAddresses32 = context.nominees.map(toEvmAddress32);

      // Push nominate call last. Although the order of calls
      // in the batch may not matter in this case.
      batchCalls.push(
        createEvmBatchCallData(Precompile.STAKING, 'nominate', [
          evmNomineeAddresses32,
        ])
      );

      return {
        functionName: 'batchAll',
        arguments: createEvmBatchCallArgs(batchCalls),
      };
    }, []);

  const substrateTxFactory = useCallback<
    SubstrateTxFactory<Partial<NominationOptions>>
  >((api, _activeSubstrateAddress, context) => {
    const bondExtraTx =
      context.bondAmount !== undefined
        ? api.tx.staking.bondExtra(context.bondAmount)
        : null;

    const setPayeeTx =
      context.payee !== undefined
        ? api.tx.staking.setPayee(getSubstratePayeeValue(context.payee))
        : null;

    const nominateTx =
      context.nominees !== undefined
        ? api.tx.staking.nominate(context.nominees)
        : null;

    const txs = [bondExtraTx, setPayeeTx, nominateTx].filter(
      (tx): tx is SubmittableExtrinsic<'promise', ISubmittableResult> =>
        tx !== null
    );

    // Nothing to update.
    if (txs.length === 0) {
      console.warn(
        'Tried to update nominator with no changes. Did you forget to handle an edge case?'
      );

      return null;
    }

    return optimizeTxBatch(api, txs);
  }, []);

  return useAgnosticTx<Precompile.BATCH, UpdateNominatorOptions>({
    name: TxName.UpdateNominator,
    precompile: Precompile.BATCH,
    substrateTxFactory,
    evmTxFactory,
  });
};

export default useUpdateNominatorTx;
