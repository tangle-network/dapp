import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';
import { isSubstrateAddress } from '@tangle-network/ui-components/utils/isSubstrateAddress';
import { decodeAddress } from '@polkadot/util-crypto';
import { OperatorPreferences } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import {
  PrimitiveField,
  PrimitiveFieldType,
} from '@tangle-network/tangle-shared-ui/types/blueprint';

export const toTanglePrimitiveEcdsaKey = (
  address: SubstrateAddress | EvmAddress,
): Uint8Array | null => {
  try {
    let originalKey: Uint8Array;
    if (isSubstrateAddress(address)) {
      const decoded = decodeAddress(address);
      originalKey = Buffer.from(decoded);
    } else {
      originalKey = Buffer.from(address.toString().slice(2), 'hex');
    }
    const ecdsaKey = new Uint8Array(65);
    ecdsaKey.set(
      originalKey.length > 65 ? originalKey.slice(0, 65) : originalKey,
      0,
    );

    return ecdsaKey;
  } catch (error) {
    console.error('Parse address failed with error', error);
    return null;
  }
};

/**
 * @dev should format data to human readable before using this function
 * TODO: update this function
 * Pricing
 *   Server cost
 *     This is quite clear and operator might just set some defaults Per CPU, Memory, GPU cost, etc. (not sure how much this would change)
 *   Benchmarking
 *     For job pricing
 *     For service usage pricing (network egress/igress costs)
 *     Storage growth rate
 *   Third-party external API pricing
 *     Phala cloud might have prices, other external services being used like AWS, GCP, etc.
 * */
export const getOperatorPricing = (
  operatorPreferences: OperatorPreferences['priceTargets'],
) => {
  return Object.values(operatorPreferences).reduce((acc, curr) => {
    return acc + Number(curr);
  }, 0);
};

export const toPrimitiveArgsDataType = (
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
            ? toPrimitiveArgsDataType([field.Optional], [data.Optional])
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
            ? [field.Array[0], toPrimitiveArgsDataType(arrayType, data.Array)]
            : [0, []],
      };
    }

    // TODO: Implement List
    if ('List' in field) {
      return {};
      //   return {
      //     'List': data && 'List' in data && Array.isArray(data.List)
      //       ? toPrimitiveArgsDataType([field.List], data.List)
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
                    ? toPrimitiveArgsDataType([type], [data.Struct[i]])[0]
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
