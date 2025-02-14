import { useCallback } from 'react';
import useSubstrateTx from '../../hooks/useSubstrateTx';
import { TxName } from '../../constants';

/**
 * Unlocks any tokens that were locked as part of a democracy vote,
 * and whose locks have expired.
 *
 * @remarks
 * This is a Substrate-only transaction (at least for now).
 */
const useDemocracyUnlockTx = () => {
  // TODO: Make this agnostic (add support for EVM).
  return useSubstrateTx({
    name: TxName.DEMOCRACY_UNLOCK,
    factory: useCallback(
      (api, activeSubstrateAddress) =>
        api.tx.democracy.unlock(activeSubstrateAddress),
      [],
    ),
  });
};

export default useDemocracyUnlockTx;
