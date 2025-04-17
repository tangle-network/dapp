import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';

type Context = {
  requestId: bigint;
};

const useServicesRejectTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.services.reject(context.requestId),
    [],
  );

  return useSubstrateTxWithNotification(
    TxName.REJECT_SERVICE_REQUEST,
    substrateTxFactory,
    SUCCESS_MESSAGES,
  );
};

export default useServicesRejectTx;
