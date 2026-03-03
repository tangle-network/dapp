import { isAddress, toHex } from 'viem';
import { encodePayload } from './payloadEncoder';
import {
  BlueprintFieldKind,
  type FormFieldValue,
  type SchemaField,
} from './types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isIntegerKind = (kind: BlueprintFieldKind): boolean => {
  return kind >= BlueprintFieldKind.Uint8 && kind <= BlueprintFieldKind.Int256;
};

const isUnsignedIntegerKind = (kind: BlueprintFieldKind): boolean => {
  return (
    kind === BlueprintFieldKind.Uint8 ||
    kind === BlueprintFieldKind.Uint16 ||
    kind === BlueprintFieldKind.Uint32 ||
    kind === BlueprintFieldKind.Uint64 ||
    kind === BlueprintFieldKind.Uint128 ||
    kind === BlueprintFieldKind.Uint256
  );
};

export class RequestArgsEncodingError extends Error {
  path: string;

  constructor(path: string, message: string) {
    super(path === '$' ? message : `${path}: ${message}`);
    this.name = 'RequestArgsEncodingError';
    this.path = path;
  }
}

const fail = (path: string, message: string): never => {
  throw new RequestArgsEncodingError(path, message);
};

const normalizeHex = (value: unknown, path: string): string => {
  if (typeof value !== 'string') {
    fail(path, 'Expected hex string');
  }

  const hex = (value as string).trim();
  if (!/^0x[0-9a-fA-F]*$/.test(hex)) {
    fail(path, 'Invalid hex format, expected 0x-prefixed hex string');
  }

  if (hex.length % 2 !== 0) {
    fail(path, 'Hex string has odd length');
  }

  return hex;
};

const normalizeFieldValue = (
  schema: SchemaField,
  value: unknown,
  path: string,
): FormFieldValue => {
  switch (schema.kind) {
    case BlueprintFieldKind.Void:
      return null;
    case BlueprintFieldKind.Bool: {
      if (typeof value !== 'boolean') {
        fail(path, 'Expected boolean');
      }
      return value as boolean;
    }
    case BlueprintFieldKind.Address: {
      if (typeof value !== 'string') {
        fail(path, 'Expected EVM address string');
      }
      const address = (value as string).trim();
      if (!isAddress(address)) {
        fail(path, 'Invalid EVM address');
      }
      return address;
    }
    case BlueprintFieldKind.String: {
      if (typeof value !== 'string') {
        fail(path, 'Expected string');
      }
      return value as string;
    }
    case BlueprintFieldKind.Bytes: {
      return normalizeHex(value, path);
    }
    case BlueprintFieldKind.Bytes32: {
      const hex = normalizeHex(value, path);
      const bytesLength = (hex.length - 2) / 2;
      if (bytesLength !== 32) {
        fail(path, `Expected 32 bytes, received ${bytesLength}`);
      }
      return hex;
    }
    case BlueprintFieldKind.FixedBytes: {
      const hex = normalizeHex(value, path);
      const bytesLength = (hex.length - 2) / 2;
      if (bytesLength !== schema.arrayLength) {
        fail(
          path,
          `Expected ${schema.arrayLength} bytes, received ${bytesLength}`,
        );
      }
      return hex;
    }
    case BlueprintFieldKind.Optional: {
      const child = schema.children[0];
      if (!child) {
        fail(path, 'Invalid optional schema definition');
      }

      if (value === null || value === undefined) {
        return { present: false };
      }

      if (isRecord(value) && 'present' in value) {
        if (typeof value.present !== 'boolean') {
          fail(path, 'Optional present flag must be boolean');
        }
        if (!value.present) {
          return { present: false };
        }
        return {
          present: true,
          inner: normalizeFieldValue(
            child,
            value.inner ?? null,
            `${path}.inner`,
          ),
        };
      }

      return {
        present: true,
        inner: normalizeFieldValue(child, value, `${path}.value`),
      };
    }
    case BlueprintFieldKind.Array: {
      const child = schema.children[0];
      if (!child) {
        fail(path, 'Invalid array schema definition');
      }
      if (!Array.isArray(value)) {
        fail(path, 'Expected fixed-size array');
      }
      const entries = value as unknown[];
      if (entries.length !== schema.arrayLength) {
        fail(
          path,
          `Expected ${schema.arrayLength} item(s), received ${entries.length}`,
        );
      }
      return entries.map((item: unknown, index: number) =>
        normalizeFieldValue(child, item, `${path}[${index}]`),
      );
    }
    case BlueprintFieldKind.List: {
      const child = schema.children[0];
      if (!child) {
        fail(path, 'Invalid list schema definition');
      }
      if (!Array.isArray(value)) {
        fail(path, 'Expected list (JSON array)');
      }
      const entries = value as unknown[];
      return entries.map((item: unknown, index: number) =>
        normalizeFieldValue(child, item, `${path}[${index}]`),
      );
    }
    case BlueprintFieldKind.Struct: {
      if (Array.isArray(value)) {
        if (value.length !== schema.children.length) {
          fail(
            path,
            `Expected ${schema.children.length} struct field(s), received ${value.length}`,
          );
        }
        return schema.children.map((child, index) =>
          normalizeFieldValue(
            child,
            value[index],
            `${path}.${child.name || `field_${index}`}`,
          ),
        );
      }

      if (!isRecord(value)) {
        fail(path, 'Expected struct as object or array');
      }
      const structValue = value as Record<string, unknown>;

      return schema.children.map((child, index) => {
        const fallbackKey = String(index);
        const namedKey = child.name;
        const candidate =
          namedKey && namedKey in structValue
            ? structValue[namedKey]
            : fallbackKey in structValue
              ? structValue[fallbackKey]
              : undefined;

        return normalizeFieldValue(
          child,
          candidate,
          `${path}.${child.name || `field_${index}`}`,
        );
      });
    }
    default: {
      if (isIntegerKind(schema.kind)) {
        if (
          typeof value !== 'bigint' &&
          typeof value !== 'number' &&
          typeof value !== 'string'
        ) {
          fail(path, 'Expected integer value');
        }

        if (typeof value === 'number' && !Number.isInteger(value)) {
          fail(path, 'Expected integer value');
        }

        const normalized =
          typeof value === 'bigint' ? value.toString() : String(value).trim();

        if (!/^-?\d+$/.test(normalized)) {
          fail(path, 'Expected integer value');
        }

        if (isUnsignedIntegerKind(schema.kind) && normalized.startsWith('-')) {
          fail(path, 'Expected unsigned integer value');
        }

        return normalized;
      }

      fail(path, `Unsupported field kind: ${schema.kind}`);
    }
  }

  return null;
};

export const encodeRequestArgsFromJson = (
  schema: SchemaField[],
  rawArgs: unknown,
): `0x${string}` => {
  if (schema.length === 0) {
    if (rawArgs === null || rawArgs === undefined) {
      return '0x';
    }

    if (!Array.isArray(rawArgs) || rawArgs.length !== 0) {
      fail('$', 'No request arguments are expected for this blueprint');
    }

    return '0x';
  }

  if (!Array.isArray(rawArgs)) {
    fail('$', 'Request arguments must be a JSON array');
  }
  const args = rawArgs as unknown[];

  if (args.length !== schema.length) {
    fail(
      '$',
      `Expected ${schema.length} request argument(s), received ${args.length}`,
    );
  }

  const normalized = schema.map((field, index) =>
    normalizeFieldValue(field, args[index], `$[${index}]`),
  );

  try {
    const encoded = encodePayload(schema, normalized);
    return encoded.length > 0 ? (toHex(encoded) as `0x${string}`) : '0x';
  } catch (error) {
    if (error instanceof RequestArgsEncodingError) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to encode request arguments';
    throw new RequestArgsEncodingError('$', message);
  }
};
