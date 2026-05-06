import { toHex } from 'viem';
import {
  BlueprintFieldKind,
  encodePayload,
  type FormFieldValue,
  type SchemaField,
} from '../../codec';
import type { PrimitiveFieldType } from '../../types/blueprint';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isSchemaFieldArray = (value: unknown): value is SchemaField[] => {
  return (
    Array.isArray(value) &&
    value.every(
      (field) =>
        isRecord(field) &&
        typeof field.kind === 'number' &&
        typeof field.name === 'string' &&
        typeof field.arrayLength === 'number' &&
        Array.isArray(field.children),
    )
  );
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
      throw new Error(`Unsupported request parameter type: ${fieldType}`);
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

  throw new Error('Unsupported request parameter type');
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
      if (typeof rawValue === 'number') {
        if (!Number.isInteger(rawValue) || !Number.isFinite(rawValue)) {
          throw new Error(`${normalizedFieldType} value must be an integer`);
        }
        return rawValue.toString();
      }
      if (typeof rawValue === 'string') {
        const trimmed = rawValue.trim();
        if (trimmed.length === 0) {
          throw new Error(`${normalizedFieldType} value is required`);
        }
        return trimmed;
      }
      if (typeof rawValue === 'bigint') {
        return rawValue;
      }
      throw new Error(`${normalizedFieldType} value must be numeric`);
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
      if (typeof rawValue !== 'string') {
        throw new Error(`${normalizedFieldType} value must be a string`);
      }
      return rawValue;
    }

    throw new Error(`Unsupported value type: ${normalizedFieldType}`);
  }

  if (isOptionalType(fieldType)) {
    if (isRecord(rawValue) && 'Optional' in rawValue) {
      const optionalValue = rawValue.Optional;
      if (optionalValue === null || optionalValue === undefined) {
        return { present: false };
      }
      return {
        present: true,
        inner: normalizeValueForField(fieldType.Optional, optionalValue),
      };
    }

    if (rawValue === null || rawValue === undefined) {
      return { present: false };
    }

    return {
      present: true,
      inner: normalizeValueForField(fieldType.Optional, rawValue),
    };
  }

  if (isArrayType(fieldType)) {
    const [length, innerType] = fieldType.Array;
    const inputValues =
      isRecord(rawValue) && Array.isArray(rawValue.Array)
        ? rawValue.Array
        : Array.isArray(rawValue)
          ? rawValue
          : null;

    if (!inputValues || inputValues.length !== length) {
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
      throw new Error('List value must be an array');
    }

    const inputValues =
      listFieldValue.length === 2 && Array.isArray(listFieldValue[1])
        ? listFieldValue[1]
        : listFieldValue;

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
          : null;

    if (!inputValues || inputValues.length !== fieldType.Struct.length) {
      throw new Error(
        `Struct value must contain ${fieldType.Struct.length} field(s)`,
      );
    }

    return fieldType.Struct.map((childFieldType, index) =>
      normalizeValueForField(childFieldType, inputValues[index]),
    );
  }

  throw new Error('Unsupported request value');
};

/**
 * Encode service configuration/request args for requestService calls.
 *
 * If request param types are provided, this encodes arguments as TLV v2 payload
 * using the protocol schema codec. When no schema is provided, this preserves
 * legacy JSON-as-UTF8 encoding.
 */
export const encodeServiceConfig = (
  requestArgs: unknown[],
  requestParamTypes?: PrimitiveFieldType[] | SchemaField[] | null,
): `0x${string}` => {
  const hasSchema =
    Array.isArray(requestParamTypes) && requestParamTypes.length > 0;

  if (hasSchema) {
    if (!requestArgs || requestArgs.length !== requestParamTypes.length) {
      throw new Error(
        `Request argument count mismatch: expected ${requestParamTypes.length}, got ${requestArgs?.length ?? 0}`,
      );
    }

    try {
      if (isSchemaFieldArray(requestParamTypes)) {
        const encoded = encodePayload(
          requestParamTypes,
          requestArgs as FormFieldValue[],
        );

        return (encoded.length > 0 ? toHex(encoded) : '0x') as `0x${string}`;
      }

      const schema = requestParamTypes.map((fieldType, index) =>
        primitiveTypeToSchemaField(fieldType, `request_${index}`),
      );
      const values = requestParamTypes.map((fieldType, index) =>
        normalizeValueForField(fieldType, requestArgs[index]),
      );
      const encoded = encodePayload(schema, values);

      return (encoded.length > 0 ? toHex(encoded) : '0x') as `0x${string}`;
    } catch (error) {
      throw new Error(
        `Failed to encode request arguments against schema: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  if (!requestArgs || requestArgs.length === 0) {
    return '0x';
  }

  // Legacy fallback for schema-less flows.
  try {
    const payload = JSON.stringify(requestArgs);
    if (payload === undefined) {
      throw new Error('Request arguments could not be serialized');
    }

    return toHex(new TextEncoder().encode(payload));
  } catch (error) {
    throw new Error(
      `Failed to encode request arguments: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    );
  }
};
