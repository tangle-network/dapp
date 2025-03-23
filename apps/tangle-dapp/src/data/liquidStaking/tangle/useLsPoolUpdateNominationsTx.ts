import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import LST_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/lst';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { convertAddressToBytes32 } from '@tangle-network/ui-components';
import { SUCCESS_MESSAGES } from '../../../hooks/useTxNotification';

type Context = {
  poolId: number;
  validators: SubstrateAddress[];
};

const useLsPoolUpdateNominationsTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, _activeSubstrateAddress, { poolId, validators }) => {
      return api.tx.lst.nominate(poolId, validators);
    },
    [],
  );

  const evmTxFactory: EvmTxFactory<
    typeof LST_PRECOMPILE_ABI,
    'nominate',
    Context
  > = useCallback((context) => {
    const validatorsAsBytes32 = context.validators.map(convertAddressToBytes32);

    return {
      functionName: 'nominate',
      arguments: [context.poolId, validatorsAsBytes32],
    };
  }, []);

  return useAgnosticTx({
    name: TxName.LS_TANGLE_POOL_UPDATE_NOMINATIONS,
    abi: LST_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.LST,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useLsPoolUpdateNominationsTx;
