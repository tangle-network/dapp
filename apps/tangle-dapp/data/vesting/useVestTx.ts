import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';

/**
 * Performs the `vesting.vest` extrinsic call.
 *
 * This action will claim all **claimable** tokens from all vesting
 * schedules associated with the active account.
 *
 * Vesting schedules that have not yet started (i.e. have not reached their
 * "cliff") will be omitted.
 */
const useVestTx = (notifyStatusUpdates?: boolean) => {
  return useAgnosticTx({
    precompile: Precompile.VESTING,
    notifyStatusUpdates,
    evmTxFactory: { functionName: 'vest', arguments: [] },
    substrateTxFactory: useCallback(
      (api) => Promise.resolve(api.tx.vesting.vest()),
      []
    ),
  });
};

export default useVestTx;
