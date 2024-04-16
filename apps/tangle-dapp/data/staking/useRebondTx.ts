import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';

type RebondTxContext = {
  amount: BN;
};

const useRebondTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, RebondTxContext> =
    useCallback(
      (context) => ({ functionName: 'rebond', arguments: [context.amount] }),
      []
    );

  const substrateTxFactory: SubstrateTxFactory<RebondTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.staking.rebond(context.amount),
    []
  );

  return useAgnosticTx<Precompile.STAKING, RebondTxContext>({
    name: 'rebond',
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useRebondTx;
