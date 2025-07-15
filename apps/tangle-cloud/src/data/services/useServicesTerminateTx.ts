import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';

type Context = {
  instanceId: bigint;
};

const useServicesTerminateTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.services.terminate(context.instanceId),
    [],
  );

  return useSubstrateTxWithNotification(
    TxName.TERMINATE_SERVICE_INSTANCE,
    substrateTxFactory,
    SUCCESS_MESSAGES,
  );
};

export default useServicesTerminateTx;
