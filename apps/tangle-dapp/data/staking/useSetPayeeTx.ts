import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { StakingRewardsDestination } from '../../types';
import getEvmPayeeValue from '../../utils/staking/getEvmPayeeValue';
import getSubstratePayeeValue from '../../utils/staking/getSubstratePayeeValue';

type SetPayeeTxContext = {
  payee: StakingRewardsDestination;
};

const useSetPayeeTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, SetPayeeTxContext> =
    useCallback((context) => {
      const payee = getEvmPayeeValue(context.payee);

      return {
        functionName: 'setPayee',
        arguments: [payee],
      };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<SetPayeeTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const payee = getSubstratePayeeValue(context.payee);

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
