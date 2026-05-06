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

    if (typeof field !== 'object') {
      if (data && typeof data === 'object' && field in data) {
        return { [field]: (data as any)[field] } as PrimitiveField;
      }

      return { [field]: data } as PrimitiveField;
    }

    if ('Optional' in field) {
      if (
        data &&
        typeof data === 'object' &&
        'Optional' in data &&
        (data as any).Optional !== null
      ) {
        const innerValue = toPrimitiveArgsDataType(
          [field.Optional],
          [(data as any).Optional],
        )[0];
        return { Optional: [field.Optional, innerValue] } as any;
      }

      return { Optional: [field.Optional, null] } as any;
    }

    if ('Array' in field) {
      const arrayType = Array.from({ length: field.Array[0] }).map(
        () => field.Array[1],
      );

      const convertedArray =
        data && 'Array' in data
          ? toPrimitiveArgsDataType(arrayType, data.Array)
          : [];

      return { Array: convertedArray } as PrimitiveField;
    }

    if ('List' in field) {
      const listItemType = field.List;

      if (
        data &&
        typeof data === 'object' &&
        'List' in data &&
        Array.isArray((data as any).List)
      ) {
        const converted = (data as any).List.map(
          (elem: any) => toPrimitiveArgsDataType([listItemType], [elem])[0],
        );
        return { List: [listItemType, converted] } as any;
      }

      return { List: [listItemType, []] };
    }

    if ('Struct' in field) {
      if (!(data && 'Struct' in data)) {
        throw new Error(
          `Missing struct data for request parameter #${index}. ` +
            "Please supply JSON that matches the blueprint's struct layout.",
        );
      }

      const innerTypes = field.Struct;
      const innerValues = data.Struct as unknown[] as Array<
        PrimitiveField | null | PrimitiveField[]
      >;

      if (innerTypes.length !== innerValues.length) {
        throw new Error(
          `Struct length mismatch for request parameter #${index}. Expected ${innerTypes.length} field(s) but got ${innerValues.length}.`,
        );
      }

      const convertedFields = toPrimitiveArgsDataType(innerTypes, innerValues);
      const namedFields = convertedFields.map((field, idx) => [
        `field_${idx}`,
        field,
      ]);

      return {
        Struct: ['', namedFields],
      } as any;
    }

    return {
      [field]: data,
    };
  });

  return data as PrimitiveField[];
};
