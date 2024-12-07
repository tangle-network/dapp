import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { Precompile } from '../../../constants/evmPrecompiles';
import useAgnosticTx from '../../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../../hooks/useSubstrateTx';

export type LsPoolJoinTxContext = {
  poolId: number;
  amount: BN;
};

const useLsPoolJoinTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsPoolJoinTxContext> =
    useCallback(async (api, _activeSubstrateAddress, { poolId, amount }) => {
      return api.tx.lst.join(amount, poolId);
    }, []);

  const evmTxFactory: EvmTxFactory<Precompile.LST, LsPoolJoinTxContext> =
    useCallback((context) => {
      return {
        functionName: 'join',
        arguments: [context.amount, context.poolId],
      };
    }, []);

  return useAgnosticTx<Precompile.LST, LsPoolJoinTxContext>({
    name: TxName.LS_TANGLE_POOL_JOIN,
    precompile: Precompile.LST,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useLsPoolJoinTx;
