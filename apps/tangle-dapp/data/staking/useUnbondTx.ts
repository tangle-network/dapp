import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';

type UnbondTxContext = {
  amount: BN;
};

const useUnbondTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, UnbondTxContext> =
    useCallback(
      (context) => ({ functionName: 'unbond', arguments: [context.amount] }),
      []
    );

  const substrateTxFactory: SubstrateTxFactory<UnbondTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.staking.unbond(context.amount),
    []
  );

  return useAgnosticTx<Precompile.STAKING, UnbondTxContext>({
    name: TxName.UNBOND,
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useUnbondTx;
