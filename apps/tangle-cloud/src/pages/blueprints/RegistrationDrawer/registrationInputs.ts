import {
  BlueprintFieldKind,
  encodePayload,
  type FormFieldValue,
  type SchemaField,
} from '@tangle-network/tangle-shared-ui/codec';
import type { PrimitiveFieldType } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { toHex } from 'viem';

const ARRAY_SEGMENT_PATTERN = /^([A-Za-z]+)\[(\d+)\]$/;
const NUMBER_SEGMENT_PATTERN = /^\d+$/;

type RegistrationParamsMap = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isOptionalType = (
  fieldType: PrimitiveFieldType,
): fieldType is { Optional: PrimitiveFieldType } => {
  return isRecord(fieldType) && 'Optional' in fieldType;
};

const isArrayType = (
  fieldType: PrimitiveFieldType,
): fieldType is { Array: [number, PrimitiveFieldType] } => {
  return isRecord(fieldType) && 'Array' in fieldType;
};

const isListType = (
  fieldType: PrimitiveFieldType,
): fieldType is { List: PrimitiveFieldType } => {
  return isRecord(fieldType) && 'List' in fieldType;
};

const isStructType = (
  fieldType: PrimitiveFieldType,
): fieldType is { Struct: PrimitiveFieldType[] } => {
  return isRecord(fieldType) && 'Struct' in fieldType;
};

const isNumberType = (fieldType: string): boolean => {
  return (
    fieldType === 'Uint8' ||
    fieldType === 'Int8' ||
    fieldType === 'Uint16' ||
    fieldType === 'Int16' ||
    fieldType === 'Uint32' ||
    fieldType === 'Int32' ||
    fieldType === 'Uint64' ||
    fieldType === 'Int64'
  );
};

const setNestedValue = (
  currentValue: unknown,
  pathSegments: string[],
  newValue: unknown,
): unknown => {
  if (pathSegments.length === 0) {
    return newValue;
  }

  const [segment, ...rest] = pathSegments;

  const arraySegmentMatch = ARRAY_SEGMENT_PATTERN.exec(segment);
  if (arraySegmentMatch) {
    const key = arraySegmentMatch[1];
    const index = Number(arraySegmentMatch[2]);
    const nextObject = isRecord(currentValue) ? { ...currentValue } : {};
    const existingArray = Array.isArray(nextObject[key]) ? nextObject[key] : [];
    const nextArray = [...existingArray];
    nextArray[index] = setNestedValue(nextArray[index], rest, newValue);
    nextObject[key] = nextArray;
    return nextObject;
  }

  if (NUMBER_SEGMENT_PATTERN.test(segment)) {
    const index = Number(segment);
    const nextArray = Array.isArray(currentValue) ? [...currentValue] : [];
    nextArray[index] = setNestedValue(nextArray[index], rest, newValue);
    return nextArray;
  }

  const nextObject = isRecord(currentValue) ? { ...currentValue } : {};
  nextObject[segment] = setNestedValue(nextObject[segment], rest, newValue);
  return nextObject;
};

const primitiveTypeToSchemaField = (
  fieldType: PrimitiveFieldType,
  name: string,
): SchemaField => {
  if (typeof fieldType === 'string') {
    const fieldKindByName: Record<string, BlueprintFieldKind> = {
      Void: BlueprintFieldKind.Void,
      Bool: BlueprintFieldKind.Bool,
      Uint8: BlueprintFieldKind.Uint8,
      Int8: BlueprintFieldKind.Int8,
      Uint16: BlueprintFieldKind.Uint16,
      Int16: BlueprintFieldKind.Int16,
      Uint32: BlueprintFieldKind.Uint32,
      Int32: BlueprintFieldKind.Int32,
      Uint64: BlueprintFieldKind.Uint64,
      Int64: BlueprintFieldKind.Int64,
      String: BlueprintFieldKind.String,
      Text: BlueprintFieldKind.String,
      Bytes: BlueprintFieldKind.Bytes,
      AccountId: BlueprintFieldKind.Address,
    };

    const kind = fieldKindByName[fieldType];
    if (kind === undefined) {
      throw new Error(`Unsupported registration field type: ${fieldType}`);
    }

    return {
      kind,
      name,
      arrayLength: 0,
      children: [],
    };
  }

  if (isOptionalType(fieldType)) {
    return {
      kind: BlueprintFieldKind.Optional,
      name,
      arrayLength: 0,
      children: [primitiveTypeToSchemaField(fieldType.Optional, `${name}_opt`)],
    };
  }

  if (isArrayType(fieldType)) {
    const [length, innerType] = fieldType.Array;
    return {
      kind: BlueprintFieldKind.Array,
      name,
      arrayLength: length,
      children: [primitiveTypeToSchemaField(innerType, `${name}_item`)],
    };
  }

  if (isListType(fieldType)) {
    return {
      kind: BlueprintFieldKind.List,
      name,
      arrayLength: 0,
      children: [primitiveTypeToSchemaField(fieldType.List, `${name}_item`)],
    };
  }

  if (isStructType(fieldType)) {
    return {
      kind: BlueprintFieldKind.Struct,
      name,
      arrayLength: 0,
      children: fieldType.Struct.map((innerType, index) =>
        primitiveTypeToSchemaField(innerType, `${name}_${index}`),
      ),
    };
  }

  throw new Error('Unsupported registration field type');
};

const normalizeValueForField = (
  fieldType: PrimitiveFieldType,
  rawValue: unknown,
): FormFieldValue => {
  if (typeof fieldType === 'string') {
    const normalizedFieldType = fieldType as string;

    if (normalizedFieldType === 'Void') {
      return null;
    }

    if (normalizedFieldType === 'Bool') {
      if (typeof rawValue === 'boolean') {
        return rawValue;
      }
      if (rawValue === 'true') {
        return true;
      }
      if (rawValue === 'false') {
        return false;
      }
      throw new Error('Bool value must be true or false');
    }

    if (isNumberType(normalizedFieldType)) {
      if (rawValue === null || rawValue === undefined || rawValue === '') {
        throw new Error(`${normalizedFieldType} value is required`);
      }
      if (
        typeof rawValue !== 'number' &&
        typeof rawValue !== 'string' &&
        typeof rawValue !== 'bigint'
      ) {
        throw new Error(`${normalizedFieldType} value must be numeric`);
      }
      if (typeof rawValue === 'number') {
        return rawValue.toString();
      }
      return rawValue as string | bigint;
    }

    if (normalizedFieldType === 'AccountId') {
      if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
        throw new Error('AccountId value is required');
      }
      return rawValue.trim();
    }

    if (
      normalizedFieldType === 'String' ||
      normalizedFieldType === 'Text' ||
      normalizedFieldType === 'Bytes'
    ) {
      if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
        throw new Error(`${normalizedFieldType} value is required`);
      }
      return rawValue;
    }

    throw new Error(`Unsupported value type: ${normalizedFieldType}`);
  }

  if (isOptionalType(fieldType)) {
    if (!isRecord(rawValue) || !('Optional' in rawValue)) {
      return { present: false };
    }

    const optionalValue = rawValue.Optional;
    if (optionalValue === null || optionalValue === undefined) {
      return { present: false };
    }

    return {
      present: true,
      inner: normalizeValueForField(fieldType.Optional, optionalValue),
    };
  }

  if (isArrayType(fieldType)) {
    const [length, innerType] = fieldType.Array;
    const inputValues =
      isRecord(rawValue) && Array.isArray(rawValue.Array)
        ? rawValue.Array
        : Array.isArray(rawValue)
          ? rawValue
          : [];

    if (inputValues.length !== length) {
      throw new Error(`Array value must contain ${length} item(s)`);
    }

    return Array.from({ length }, (_, index) =>
      normalizeValueForField(innerType, inputValues[index]),
    );
  }

  if (isListType(fieldType)) {
    const listFieldValue =
      isRecord(rawValue) && 'List' in rawValue ? rawValue.List : rawValue;
    if (!Array.isArray(listFieldValue)) {
      throw new Error('List value is required');
    }
    const inputValues =
      Array.isArray(listFieldValue) &&
      listFieldValue.length === 2 &&
      Array.isArray(listFieldValue[1])
        ? listFieldValue[1]
        : Array.isArray(listFieldValue)
          ? listFieldValue
          : [];

    return Array.from({ length: inputValues.length }, (_, index) =>
      normalizeValueForField(fieldType.List, inputValues[index]),
    );
  }

  if (isStructType(fieldType)) {
    const inputValues =
      isRecord(rawValue) && Array.isArray(rawValue.Struct)
        ? rawValue.Struct
        : Array.isArray(rawValue)
          ? rawValue
          : [];

    if (inputValues.length !== fieldType.Struct.length) {
      throw new Error(
        `Struct value must contain ${fieldType.Struct.length} field(s)`,
      );
    }

    return fieldType.Struct.map((childFieldType, index) =>
      normalizeValueForField(childFieldType, inputValues[index]),
    );
  }

  throw new Error('Unsupported registration value');
};

const hasRequiredValue = (
  fieldType: PrimitiveFieldType,
  rawValue: unknown,
): boolean => {
  if (typeof fieldType === 'string') {
    const normalizedFieldType = fieldType as string;

    if (normalizedFieldType === 'Void') {
      return true;
    }

    if (normalizedFieldType === 'Bool') {
      return (
        rawValue === 'true' ||
        rawValue === 'false' ||
        typeof rawValue === 'boolean'
      );
    }

    if (isNumberType(normalizedFieldType)) {
      return !(rawValue === undefined || rawValue === null || rawValue === '');
    }

    if (
      normalizedFieldType === 'String' ||
      normalizedFieldType === 'Text' ||
      normalizedFieldType === 'Bytes' ||
      normalizedFieldType === 'AccountId'
    ) {
      return typeof rawValue === 'string' && rawValue.trim().length > 0;
    }

    return rawValue !== undefined && rawValue !== null;
  }

  if (isOptionalType(fieldType)) {
    if (!isRecord(rawValue) || !('Optional' in rawValue)) {
      return true;
    }
    const optionalValue = rawValue.Optional;
    if (optionalValue === null || optionalValue === undefined) {
      return true;
    }
    return hasRequiredValue(fieldType.Optional, optionalValue);
  }

  if (isArrayType(fieldType)) {
    const [length, innerType] = fieldType.Array;
    const inputValues =
      isRecord(rawValue) && Array.isArray(rawValue.Array)
        ? rawValue.Array
        : Array.isArray(rawValue)
          ? rawValue
          : [];

    if (inputValues.length !== length) {
      return false;
    }

    for (let index = 0; index < length; index++) {
      if (!hasRequiredValue(innerType, inputValues[index])) {
        return false;
      }
    }

    return true;
  }

  if (isListType(fieldType)) {
    const listFieldValue =
      isRecord(rawValue) && 'List' in rawValue ? rawValue.List : rawValue;
    if (!Array.isArray(listFieldValue)) {
      return false;
    }
    const inputValues =
      Array.isArray(listFieldValue) &&
      listFieldValue.length === 2 &&
      Array.isArray(listFieldValue[1])
        ? listFieldValue[1]
        : Array.isArray(listFieldValue)
          ? listFieldValue
          : [];

    for (let index = 0; index < inputValues.length; index++) {
      if (!hasRequiredValue(fieldType.List, inputValues[index])) {
        return false;
      }
    }

    return true;
  }

  if (isStructType(fieldType)) {
    const inputValues =
      isRecord(rawValue) && Array.isArray(rawValue.Struct)
        ? rawValue.Struct
        : Array.isArray(rawValue)
          ? rawValue
          : [];

    if (inputValues.length !== fieldType.Struct.length) {
      return false;
    }

    return fieldType.Struct.every((childFieldType, index) =>
      hasRequiredValue(childFieldType, inputValues[index]),
    );
  }

  return false;
};

export const upsertRegistrationParamValue = (
  currentParams: RegistrationParamsMap,
  paramPath: string,
  value: unknown,
): RegistrationParamsMap => {
  const [rootParamKey, ...pathSegments] = paramPath.split('.');
  if (!rootParamKey) {
    return currentParams;
  }

  const nextRootValue = setNestedValue(
    currentParams[rootParamKey],
    pathSegments,
    value,
  );

  return {
    ...currentParams,
    [rootParamKey]: nextRootValue,
  };
};

export const getMissingRegistrationParamIndices = (
  registrationParams: PrimitiveFieldType[],
  params: RegistrationParamsMap,
): number[] => {
  return registrationParams.reduce<number[]>((missing, fieldType, index) => {
    const rawValue = params[index.toString()];
    if (!hasRequiredValue(fieldType, rawValue)) {
      missing.push(index);
    }
    return missing;
  }, []);
};

export const encodeRegistrationInputs = (
  registrationParams: PrimitiveFieldType[],
  params: RegistrationParamsMap,
): `0x${string}` => {
  if (registrationParams.length === 0) {
    return '0x';
  }

  const schema = registrationParams.map((fieldType, index) =>
    primitiveTypeToSchemaField(fieldType, `param_${index}`),
  );
  const values = registrationParams.map((fieldType, index) =>
    normalizeValueForField(fieldType, params[index.toString()]),
  );
  const encodedPayload = encodePayload(schema, values);

  return (
    encodedPayload.length > 0 ? toHex(encodedPayload) : '0x'
  ) as `0x${string}`;
};
