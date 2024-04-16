import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';

/**
 * Stop nominating validators.
 */
const useChillTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING> = useCallback(
    () => ({ functionName: 'chill', arguments: [] }),
    []
  );

  const substrateTxFactory: SubstrateTxFactory = useCallback(
    (api, _activeSubstrateAddress) => api.tx.staking.chill(),
    []
  );

  return useAgnosticTx<Precompile.STAKING>({
    name: 'chill',
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useChillTx;
