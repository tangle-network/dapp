import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { ApprovalConfirmationFormFields } from '../../types';
import createAssetIdEnum from '@tangle-network/tangle-shared-ui/utils/createAssetIdEnum';

type Context = ApprovalConfirmationFormFields;

const useServicesApproveTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const securityCommitments = context.securityCommitment.map(
        (commitment) => ({
          asset: createAssetIdEnum(commitment.assetId),
          exposurePercent: commitment.exposurePercent,
        }),
      );

      return api.tx.services.approve(context.requestId, securityCommitments);
    },
    [],
  );

  return useSubstrateTxWithNotification(
    TxName.APPROVE_SERVICE_REQUEST,
    substrateTxFactory,
    SUCCESS_MESSAGES,
  );
};

export default useServicesApproveTx;
