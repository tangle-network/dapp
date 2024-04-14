import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { useCallback } from 'react';

import useSubstrateTx, { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import getSubstratePayeeValue from '../../utils/staking/getSubstratePayeeValue';
import { NominationOptions } from './useSetupNominatorTx';

const useUpdateNominatorTx = () => {
  // TODO: EVM support.

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

  return useSubstrateTx<Partial<NominationOptions>>(substrateTxFactory);
};

export default useUpdateNominatorTx;
