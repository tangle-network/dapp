import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { PrecompileAddress } from '../../../constants/evmPrecompiles';
import useAgnosticTx from '../../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../../hooks/useSubstrateTx';
import LST_PRECOMPILE_ABI from '../../../abi/lst';
import { toSubstrateBytes32Address } from '@webb-tools/webb-ui-components';

type Context = {
  poolId: number;
  points: BN;
};

const useLsPoolUnbondTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, activeSubstrateAddress, { poolId, points }) => {
      return api.tx.lst.unbond({ Id: activeSubstrateAddress }, poolId, points);
    },
    [],
  );

  const evmTxFactory: EvmTxFactory<
    typeof LST_PRECOMPILE_ABI,
    'unbond',
    Context
  > = useCallback((context, activeEvmAddress20) => {
    return {
      functionName: 'unbond',
      arguments: [
        toSubstrateBytes32Address(activeEvmAddress20),
        context.poolId,
        BigInt(context.points.toString()),
      ],
    };
  }, []);

  return useAgnosticTx({
    name: TxName.LS_TANGLE_POOL_UNBOND,
    abi: LST_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.LST,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useLsPoolUnbondTx;
