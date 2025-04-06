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
import {
  PrimitiveField,
  PrimitiveFieldType,
} from '@tangle-network/tangle-shared-ui/types/blueprint';

type Context = RegisterServiceFormFields;

export const toPrimitiveDataType = (
  fieldType: PrimitiveFieldType[],
  fieldData: Array<PrimitiveField | null | PrimitiveField[]>,
): PrimitiveField[] => {
  const data = fieldType.map((field, index) => {
    const data = fieldData[index];

    // `field` is not in these types Optional, Array, List, Struct
    if (typeof field !== 'object') {
      return {
        [field]: data,
      };
    }

    if ('Optional' in field) {
      return {
        Optional:
          data && 'Optional' in data
            ? toPrimitiveDataType([field.Optional], [data.Optional])
            : null,
      };
    }

    if ('Array' in field) {
      const arrayType = Array.from({ length: field.Array[0] }).map(
        () => field.Array[1],
      );
      return {
        Array:
          data && 'Array' in data
            ? [field.Array[0], toPrimitiveDataType(arrayType, data.Array)]
            : [0, []],
      };
    }

    // TODO: Implement List
    if ('List' in field) {
      return {};
      //   return {
      //     'List': data && 'List' in data && Array.isArray(data.List)
      //       ? toPrimitiveDataType([field.List], data.List)
      //       : []
      //   }
    }

    if ('Struct' in field) {
      return {
        Struct:
          data && 'Struct' in data
            ? [
                field.Struct,
                field.Struct.map((type, i) => [
                  type,
                  typeof type === 'object'
                    ? toPrimitiveDataType([type], [data.Struct[i]])[0]
                    : { [type]: data.Struct[i] },
                ]),
              ]
            : [[], []],
      };
    }

    return {
      [field]: data,
    };
  });

  return data as PrimitiveField[];
};

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
          registrationArgs[idx],
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
