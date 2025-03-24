import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import VESTING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/vesting';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

/**
 * Performs the `vesting.vest` extrinsic call.
 *
 * This action will claim all **claimable** tokens from all vesting
 * schedules associated with the active account.
 *
 * Vesting schedules that have not yet started (i.e. have not reached their
 * "cliff") will be omitted.
 */
const useVestTx = () => {
  return useAgnosticTx({
    name: TxName.VEST,
    abi: VESTING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.VESTING,
    evmTxFactory: { functionName: 'vest', arguments: [] },
    substrateTxFactory: useCallback((api) => api.tx.vesting.vest(), []),
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useVestTx;
