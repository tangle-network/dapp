import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import STAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/staking';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

/**
 * Stop nominating validators.
 */
const useChillTx = () => {
  const evmTxFactory: EvmTxFactory<typeof STAKING_PRECOMPILE_ABI, 'chill'> =
    useCallback(() => ({ functionName: 'chill', arguments: [] }), []);

  const substrateTxFactory: SubstrateTxFactory = useCallback(
    (api, _activeSubstrateAddress) => api.tx.staking.chill(),
    [],
  );

  return useAgnosticTx({
    name: TxName.CHILL,
    abi: STAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.STAKING,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useChillTx;
