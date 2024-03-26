import { useCallback } from 'react';

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
const useVestTx = (notifyTxStatusUpdates?: boolean) => {
  return useAgnosticTx(
    'vesting',
    'vest',
    [],
    useCallback((api) => Promise.resolve(api.tx.vesting.vest()), []),
    notifyTxStatusUpdates
  );
};

export default useVestTx;
