import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { StakingPayee } from '../../types';
import { getPayeeValue } from './useBondTx';

type SetPayeeTxContext = {
  payee: StakingPayee;
};

const useSetPayeeTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, SetPayeeTxContext> =
    useCallback((context) => {
      const payee = getPayeeValue(context.payee, true);

      return {
        functionName: 'setPayee',
        arguments: [payee],
      };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<SetPayeeTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const payee = getPayeeValue(context.payee, false);

      return api.tx.staking.setPayee(payee);
    },
    []
  );

  return useAgnosticTx<Precompile.STAKING, SetPayeeTxContext>({
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useSetPayeeTx;
