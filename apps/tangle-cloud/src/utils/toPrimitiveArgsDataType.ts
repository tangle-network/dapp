import {
  PrimitiveField,
  PrimitiveFieldType,
} from '@tangle-network/tangle-shared-ui/types/blueprint';

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
