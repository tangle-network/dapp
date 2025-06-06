import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import convertAddressToBytes32 from '@tangle-network/ui-components/utils/convertAddressToBytes32';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import {
  AbiBatchCall,
  EvmTxFactory,
} from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import optimizeTxBatch from '@tangle-network/tangle-shared-ui/utils/optimizeTxBatch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import createEvmBatchCall from '../../utils/staking/createEvmBatchCall';
import getEvmPayeeValue from '../../utils/staking/getEvmPayeeValue';
import getSubstratePayeeValue from '../../utils/staking/getSubstratePayeeValue';
import { NominationOptionsContext } from './useSetupNominatorTx';
import BATCH_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/batch';
import STAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/staking';
import enumValueToNumber from '../../utils/enumValueToNumber';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

export type Context = Partial<NominationOptionsContext> & {
  nominees: Set<SubstrateAddress>;
};

const useUpdateNominatorTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof BATCH_PRECOMPILE_ABI,
    'batchAll',
    Context
  > = useCallback((context) => {
    const batchCalls: AbiBatchCall[] = [];

    // If payee was provided, add the call to set the payee.
    if (context.payee !== undefined) {
      const payee = getEvmPayeeValue(context.payee);

      // TODO: Are we missing adding all the EVM addresses for the other reward destinations?
      if (payee === null) {
        throw new Error(
          'There is no EVM destination address registered for the given payee',
        );
      }

      batchCalls.push(
        createEvmBatchCall(
          STAKING_PRECOMPILE_ABI,
          PrecompileAddress.STAKING,
          'setPayee',
          [enumValueToNumber(payee)],
        ),
      );
    }

    // If a bond amount was provided, add the call to bond extra.
    if (context.bondAmount !== undefined) {
      batchCalls.push(
        createEvmBatchCall(
          STAKING_PRECOMPILE_ABI,
          PrecompileAddress.STAKING,
          'bondExtra',
          [BigInt(context.bondAmount.toString())],
        ),
      );
    }

    const evmNomineeAddresses32 = Array.from(context.nominees).map(
      convertAddressToBytes32,
    );

    // Push nominate call last. Although the order of calls
    // in the batch may not matter in this case.
    batchCalls.push(
      createEvmBatchCall(
        STAKING_PRECOMPILE_ABI,
        PrecompileAddress.STAKING,
        'nominate',
        [evmNomineeAddresses32],
      ),
    );

    return {
      functionName: 'batchAll',
      arguments: createEvmBatchCallArgs(batchCalls),
    };
  }, []);

  const substrateTxFactory = useCallback<
    SubstrateTxFactory<Partial<NominationOptionsContext>>
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
        ? api.tx.staking.nominate(Array.from(context.nominees))
        : null;

    const txs = [bondExtraTx, setPayeeTx, nominateTx].filter(
      (tx): tx is SubmittableExtrinsic<'promise', ISubmittableResult> =>
        tx !== null,
    );

    // Nothing to update.
    if (txs.length === 0) {
      console.warn(
        'Tried to update nominator with no changes. Did you forget to handle an edge case?',
      );

      return null;
    }

    return optimizeTxBatch(api, txs);
  }, []);

  return useAgnosticTx({
    name: TxName.UPDATE_NOMINATOR,
    abi: BATCH_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.BATCH,
    substrateTxFactory,
    evmTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useUpdateNominatorTx;
