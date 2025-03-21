import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { convertAddressToBytes32 } from '@tangle-network/ui-components';
import SERVICES_PRECOMPILE_ABI from '../../abi/services';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';

type ServiceSecurityCommitment = {
  assetId: RestakeAssetId;
  exposurePercentage: number;
};

type Context = {
  requestId: BN;
  securityCommitments: ServiceSecurityCommitment[];
};

const useServicesApproveTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof SERVICES_PRECOMPILE_ABI,
    'approve',
    Context
  > = useCallback(
    (context) => ({
      functionName: 'approve',
      arguments: [
        convertAddressToBytes32(context.operatorAddress),
        BigInt(context.amount.toString()),
        // TODO: Blueprint selection. For now, defaulting to none.
        [],
      ],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.services.approve(
        context.requestId,
        context.securityCommitments.map((commitment) => ({
          asset: commitment.assetId,
          exposurePercentage: commitment.exposurePercentage,
        })),
      ),
    [],
  );

  return useAgnosticTx({
    name: TxName.SERVICES_APPROVE,
    abi: SERVICES_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.SERVICES,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useServicesApproveTx;
