import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { Precompile } from '../../../constants/precompiles';
import useAgnosticTx from '../../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../../hooks/useSubstrateTx';

export type LsPoolUnbondTxContext = {
  poolId: number;
  points: BN;
};

const useLsPoolUnbondTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsPoolUnbondTxContext> =
    useCallback(async (api, activeSubstrateAddress, { poolId, points }) => {
      return api.tx.lst.unbond({ Id: activeSubstrateAddress }, poolId, points);
    }, []);

  const evmTxFactory: EvmTxFactory<Precompile.LST, LsPoolUnbondTxContext> =
    useCallback((context, activeEvmAddress20) => {
      return {
        functionName: 'unbond',
        arguments: [activeEvmAddress20, context.poolId, context.points],
      };
    }, []);

  return useAgnosticTx<Precompile.LST, LsPoolUnbondTxContext>({
    name: TxName.LS_TANGLE_POOL_UNBOND,
    precompile: Precompile.LST,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useLsPoolUnbondTx;
