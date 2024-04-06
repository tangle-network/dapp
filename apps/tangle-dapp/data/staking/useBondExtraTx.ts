import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';

type BondExtraTxContext = {
  amount: BN;
};

const useBondExtraTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, BondExtraTxContext> =
    useCallback(
      (context) => ({ functionName: 'bondExtra', arguments: [context.amount] }),
      []
    );

  const substrateTxFactory: SubstrateTxFactory<BondExtraTxContext> =
    useCallback(
      (api, _activeSubstrateAddress, context) =>
        api.tx.staking.bondExtra(context.amount),
      []
    );

  return useAgnosticTx<Precompile.STAKING, BondExtraTxContext>({
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useBondExtraTx;
