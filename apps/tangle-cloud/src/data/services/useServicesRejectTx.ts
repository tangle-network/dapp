import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import SERVICES_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/services';

type Context = {
  requestId: number;
};

const useServicesRejectTx = () => {
  // @dev Services precompile does not have the `reject` function
  const evmTxFactory: EvmTxFactory<any, any, Context> = useCallback(
    (_context) => ({
      functionName: 'reject',
      arguments: [],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.services.reject(new BN(context.requestId)),
    [],
  );

  return useAgnosticTx({
    name: TxName.REJECT_SERVICE_REQUEST,
    abi: SERVICES_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.SERVICES,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useServicesRejectTx;
