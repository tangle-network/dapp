import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import LST_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/lst';
import { PalletTangleLstPoolsPoolState } from '@polkadot/types/lookup';
import { SUCCESS_MESSAGES } from '../../../hooks/useTxNotification';

type Context = {
  poolId: number;
  state: PalletTangleLstPoolsPoolState['type'];
};

const useLsPoolSetStateTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, _activeSubstrateAddress, { poolId, state }) => {
      return api.tx.lst.setState(poolId, state);
    },
    [],
  );

  const evmTxFactory: EvmTxFactory<
    typeof LST_PRECOMPILE_ABI,
    'setState',
    Context
  > = useCallback((context) => {
    let stateAsUint8: 0 | 1 | 2;

    switch (context.state) {
      case 'Open':
        stateAsUint8 = 0;

        break;
      case 'Blocked':
        stateAsUint8 = 1;

        break;
      case 'Destroying':
        stateAsUint8 = 2;

        break;
    }

    return {
      functionName: 'setState',
      arguments: [context.poolId, BigInt(stateAsUint8)],
    };
  }, []);

  return useAgnosticTx({
    name: TxName.LS_TANGLE_POOL_SET_STATE,
    abi: LST_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.LST,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useLsPoolSetStateTx;
