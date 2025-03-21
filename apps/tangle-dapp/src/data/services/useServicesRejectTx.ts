import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import SERVICES_PRECOMPILE_ABI from '../../abi/services';

type Context = {
  requestId: BN;
};

const useServicesRejectTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof SERVICES_PRECOMPILE_ABI,
    'reject',
    Context
  > = useCallback(
    (context) => ({
      functionName: 'reject',
      arguments: [BigInt(context.requestId.toString())],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.services.reject(context.requestId),
    [],
  );

  return useAgnosticTx({
    name: TxName.SERVICES_REJECT,
    abi: SERVICES_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.SERVICES,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useServicesRejectTx;
