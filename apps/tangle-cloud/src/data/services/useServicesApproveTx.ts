import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import SERVICES_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/services';
import { ApprovalConfirmationFormFields } from '../../types';
import { isEvmAddress } from '@tangle-network/ui-components';

type Context = ApprovalConfirmationFormFields;

const useServicesApproveTx = () => {
  // @dev Services precompile does not have the `approve` function
  const evmTxFactory: EvmTxFactory<any, any, Context> = useCallback(
    (_context) => ({
      functionName: 'approve',
      arguments: [],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const securityCommitments = context.securityCommitment.map(
        (commitment) => ({
          asset: isEvmAddress(commitment.assetId)
            ? { Erc20: new BN(commitment.assetId) }
            : { Custom: new BN(commitment.assetId) },
          exposurePercent: commitment.exposurePercent,
        }),
      );

      return api.tx.services.approve(context.requestId, securityCommitments);
    },
    [],
  );

  return useAgnosticTx({
    name: TxName.APPROVE_SERVICE_REQUEST,
    abi: SERVICES_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.SERVICES,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useServicesApproveTx;
