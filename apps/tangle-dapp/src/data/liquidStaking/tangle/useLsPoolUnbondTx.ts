import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import LST_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/lst';
import { convertAddressToBytes32 } from '@tangle-network/ui-components';
import { SUCCESS_MESSAGES } from '../../../hooks/useTxNotification';

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
        convertAddressToBytes32(activeEvmAddress20),
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
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useLsPoolUnbondTx;
