import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { DeployBlueprintSchema } from '../../utils/validations/deployBlueprint';

type Context = DeployBlueprintSchema & {
  blueprintId: number;
};

const parseDeployBlueprintSchema = (context: Context) => {
  const { operators, assets, securityCommitments } = context;

  return {
    operators,
  };
};

const useServiceRegisterTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, _activeSubstrateAddress, context) => {
      return api.tx.services.request(
        undefined,
        context.blueprintId,
        context.BasicInfo.permittedCallers,
        context.OperatorSelection.operators,
        [],
        [],
        context.BasicInfo.instanceDuration,
        [],
        [],
      )
    },
    [],
  );

  return useSubstrateTxWithNotification(
    TxName.DEPLOY_BLUEPRINT,
    substrateTxFactory,
    SUCCESS_MESSAGES,
  );
};

export default useServiceRegisterTx;
