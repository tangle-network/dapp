import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import LST_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/lst';
import { SUCCESS_MESSAGES } from '../../../hooks/useTxNotification';

type Context = {
  poolId: number;
  amount: BN;
};

const useLsPoolJoinTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, _activeSubstrateAddress, { poolId, amount }) => {
      return api.tx.lst.join(amount, poolId);
    },
    [],
  );

  const evmTxFactory: EvmTxFactory<typeof LST_PRECOMPILE_ABI, 'join', Context> =
    useCallback((context) => {
      return {
        functionName: 'join',
        arguments: [BigInt(context.amount.toString()), context.poolId],
      };
    }, []);

  return useAgnosticTx({
    name: TxName.LS_TANGLE_POOL_JOIN,
    abi: LST_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.LST,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useLsPoolJoinTx;
