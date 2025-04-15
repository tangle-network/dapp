import optimizeTxBatch from '@tangle-network/tangle-shared-ui/utils/optimizeTxBatch';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { RegisterServiceFormFields } from '../../types';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { parseUnits } from 'viem';

type Context = RegisterServiceFormFields;

const useServicesRegisterTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, _activeSubstrateAddress, context) => {
      const { blueprintIds, preferences, registrationArgs, amounts } = context;

      // TODO: Find a better way to get the chain decimals
      const decimals =
        api.registry.chainDecimals.length > 0
          ? api.registry.chainDecimals[0]
          : TANGLE_TOKEN_DECIMALS;

      const registerTx = blueprintIds.map((blueprintId, idx) => {
        return api.tx.services.register(
          blueprintId,
          preferences[idx],
          registrationArgs[idx],
          parseUnits(amounts[idx].toString(), decimals),
        );
      });

      return optimizeTxBatch(api, registerTx);
    },
    [],
  );

  return useSubstrateTxWithNotification(
    TxName.REGISTER_BLUEPRINT,
    substrateTxFactory,
    SUCCESS_MESSAGES,
  );
};

export default useServicesRegisterTx;
