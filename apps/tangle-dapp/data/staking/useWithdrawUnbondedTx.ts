import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import useSlashingSpans from './useSlashingSpans';

const useWithdrawUnbondedTx = () => {
  const { data: slashingSpans } = useSlashingSpans();

  const evmTxFactory: EvmTxFactory<Precompile.STAKING> = useCallback(() => {
    if (slashingSpans === null) {
      return null;
    }

    return {
      functionName: 'withdrawUnbonded',
      arguments: [slashingSpans],
    };
  }, [slashingSpans]);

  const substrateTxFactory: SubstrateTxFactory = useCallback(
    (api) => {
      if (slashingSpans === null) {
        return null;
      }

      return api.tx.staking.withdrawUnbonded(slashingSpans);
    },
    [slashingSpans]
  );

  return useAgnosticTx<Precompile.STAKING>({
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useWithdrawUnbondedTx;
