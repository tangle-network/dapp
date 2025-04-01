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
import { PrimitiveField } from '@tangle-network/tangle-shared-ui/types/blueprint';

type Context = RegisterServiceFormFields;

const toPrimitiveDataType = (fieldData: PrimitiveField[]): PrimitiveField[] => {
  const data = fieldData.map((field) => {
    const [key, value] = Object.entries(field)[0];

    switch (key) {
      case 'Bool':
        return [key, value === "true"];
      // TODO: Handle other types
      default:
        return [key, value];
    }
  });

  return Object.fromEntries(data);
}

const useServiceRegisterTx = () => {
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
          toPrimitiveDataType(registrationArgs[idx]),
          parseUnits(amounts[idx].toString(), decimals),
        );
      });

      if (registerTx.length > 1) {
        return api.tx.utility.batch(registerTx);
      }

      return registerTx[0];
    },
    [],
  );

  return useSubstrateTxWithNotification(
    TxName.REGISTER_BLUEPRINT,
    substrateTxFactory,
    SUCCESS_MESSAGES,
  );
};

export default useServiceRegisterTx;
