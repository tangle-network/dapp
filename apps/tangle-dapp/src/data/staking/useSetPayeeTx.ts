import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { StakingRewardsDestination } from '../../types';
import getEvmPayeeValue from '../../utils/staking/getEvmPayeeValue';
import getSubstratePayeeValue from '../../utils/staking/getSubstratePayeeValue';
import STAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/staking';
import enumValueToNumber from '../../utils/enumValueToNumber';

type Context = {
  payee: StakingRewardsDestination;
};

const useSetPayeeTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof STAKING_PRECOMPILE_ABI,
    'setPayee',
    Context
  > = useCallback((context) => {
    const payee = getEvmPayeeValue(context.payee);

    // TODO: Are we missing adding all the EVM addresses for the other reward destinations?
    if (payee === null) {
      throw new Error(
        'There is no EVM destination address registered for the given payee',
      );
    }

    return {
      functionName: 'setPayee',
      arguments: [enumValueToNumber(payee)],
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const payee = getSubstratePayeeValue(context.payee);

      return api.tx.staking.setPayee(payee);
    },
    [],
  );

  return useAgnosticTx({
    name: TxName.SET_PAYEE,
    abi: STAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useSetPayeeTx;
