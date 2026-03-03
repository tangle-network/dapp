/**
 * Decode compact binary payload to named decoded values.
 * Mirrors the encoder. Returns null on any decode failure (graceful fallback).
 */

import { readPayloadCompactLength } from './compactLength';
import {
  BlueprintFieldKind,
  type DecodedValue,
  type NamedDecodedField,
  type SchemaField,
} from './types';

interface DecodeCursor {
  offset: number;
}

const FIXED_SIZE_MAP: Partial<Record<BlueprintFieldKind, number>> = {
  [BlueprintFieldKind.Bool]: 1,
  [BlueprintFieldKind.Uint8]: 1,
  [BlueprintFieldKind.Int8]: 1,
  [BlueprintFieldKind.Uint16]: 2,
  [BlueprintFieldKind.Int16]: 2,
  [BlueprintFieldKind.Uint32]: 4,
  [BlueprintFieldKind.Int32]: 4,
  [BlueprintFieldKind.Uint64]: 8,
  [BlueprintFieldKind.Int64]: 8,
  [BlueprintFieldKind.Uint128]: 16,
  [BlueprintFieldKind.Int128]: 16,
  [BlueprintFieldKind.Uint256]: 32,
  [BlueprintFieldKind.Int256]: 32,
  [BlueprintFieldKind.Address]: 20,
  [BlueprintFieldKind.Bytes32]: 32,
};

const isIntegerKind = (kind: BlueprintFieldKind): boolean => {
  return kind >= BlueprintFieldKind.Uint8 && kind <= BlueprintFieldKind.Int256;
};

const isSigned = (kind: BlueprintFieldKind): boolean => {
  return (
    kind === BlueprintFieldKind.Int8 ||
    kind === BlueprintFieldKind.Int16 ||
    kind === BlueprintFieldKind.Int32 ||
    kind === BlueprintFieldKind.Int64 ||
    kind === BlueprintFieldKind.Int128 ||
    kind === BlueprintFieldKind.Int256
  );
};

/**
 * Decodes a fixed-width big-endian integer.
 * Signed values are interpreted as two's-complement.
 */
const decodeBigIntBE = (
  data: Uint8Array,
  offset: number,
  byteSize: number,
  signed: boolean,
): bigint => {
  let n = BigInt(0);
  for (let i = 0; i < byteSize; i++) {
    n = (n << BigInt(8)) | BigInt(data[offset + i]);
  }
  if (signed) {
    const totalBits = BigInt(byteSize * 8);
    const signBit = BigInt(1) << (totalBits - BigInt(1));
    if (n >= signBit) {
      n -= BigInt(1) << totalBits;
    }
  }
  return n;
};

/**
 * Formats bytes as a 0x-prefixed lowercase hex string.
 */
const bytesToHex = (bytes: Uint8Array): string => {
  return (
    '0x' +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
};

/**
 * Recursively decodes a schema field from payload bytes while advancing cursor.
 * `limit` is used by nested containers to enforce local boundaries.
 */
const decodeField = (
  schema: SchemaField,
  data: Uint8Array,
  cursor: DecodeCursor,
  limit: number,
): DecodedValue => {
  const { kind } = schema;

  if (kind === BlueprintFieldKind.Void) {
    return { tag: 'void' };
  }

  if (kind === BlueprintFieldKind.Bool) {
    if (cursor.offset + 1 > limit) {
      throw new Error('Truncated Bool');
    }
    const value = data[cursor.offset] !== 0;
    cursor.offset += 1;
    return { tag: 'bool', value };
  }

  // Fixed-size integer types (Uint8..Int256)
  if (isIntegerKind(kind)) {
    const fixedSize = FIXED_SIZE_MAP[kind];
    if (fixedSize === undefined) {
      throw new Error(`Unsupported integer kind: ${BlueprintFieldKind[kind]}`);
    }
    if (cursor.offset + fixedSize > limit) {
      throw new Error(`Truncated ${BlueprintFieldKind[kind]}`);
    }
    const value = decodeBigIntBE(
      data,
      cursor.offset,
      fixedSize,
      isSigned(kind),
    );
    cursor.offset += fixedSize;
    return { tag: 'number', value };
  }

  if (kind === BlueprintFieldKind.Address) {
    if (cursor.offset + 20 > limit) {
      throw new Error('Truncated Address');
    }
    const bytes = data.slice(cursor.offset, cursor.offset + 20);
    cursor.offset += 20;
    return { tag: 'address', value: toChecksumAddress(bytesToHex(bytes)) };
  }

  if (kind === BlueprintFieldKind.Bytes32) {
    if (cursor.offset + 32 > limit) {
      throw new Error('Truncated Bytes32');
    }
    const value = data.slice(cursor.offset, cursor.offset + 32);
    cursor.offset += 32;
    return { tag: 'bytes32', value };
  }

  if (kind === BlueprintFieldKind.FixedBytes) {
    const len = schema.arrayLength;
    if (cursor.offset + len > limit) {
      throw new Error('Truncated FixedBytes');
    }
    const value = data.slice(cursor.offset, cursor.offset + len);
    cursor.offset += len;
    return { tag: 'fixedBytes', value };
  }

  if (kind === BlueprintFieldKind.String) {
    const { value: len, bytesRead } = readPayloadCompactLength(
      data,
      cursor.offset,
    );
    cursor.offset += bytesRead;
    if (cursor.offset + len > limit) {
      throw new Error('Truncated String');
    }
    const strBytes = data.slice(cursor.offset, cursor.offset + len);
    cursor.offset += len;
    return { tag: 'string', value: new TextDecoder().decode(strBytes) };
  }

  if (kind === BlueprintFieldKind.Bytes) {
    const { value: len, bytesRead } = readPayloadCompactLength(
      data,
      cursor.offset,
    );
    cursor.offset += bytesRead;
    if (cursor.offset + len > limit) {
      throw new Error('Truncated Bytes');
    }
    const value = data.slice(cursor.offset, cursor.offset + len);
    cursor.offset += len;
    return { tag: 'bytes', value };
  }

  if (kind === BlueprintFieldKind.Optional) {
    const childSchema = schema.children[0];
    if (!childSchema) {
      throw new Error('Optional must have 1 child');
    }

    const { value: len, bytesRead } = readPayloadCompactLength(
      data,
      cursor.offset,
    );
    cursor.offset += bytesRead;

    if (len === 0) {
      return { tag: 'optional', present: false };
    }

    const endCursor = cursor.offset + len;
    if (endCursor > limit) {
      throw new Error('Truncated Optional');
    }

    const inner = decodeField(childSchema, data, cursor, endCursor);
    if (cursor.offset !== endCursor) {
      throw new Error('Optional inner did not consume expected bytes');
    }
    return { tag: 'optional', present: true, inner };
  }

  if (kind === BlueprintFieldKind.Array) {
    const childSchema = schema.children[0];
    if (!childSchema) {
      throw new Error('Array must have 1 child');
    }

    const elements: DecodedValue[] = [];
    for (let i = 0; i < schema.arrayLength; i++) {
      elements.push(decodeField(childSchema, data, cursor, limit));
    }
    return { tag: 'array', elements };
  }

  if (kind === BlueprintFieldKind.List) {
    const childSchema = schema.children[0];
    if (!childSchema) {
      throw new Error('List must have 1 child');
    }

    const { value: count, bytesRead } = readPayloadCompactLength(
      data,
      cursor.offset,
    );
    cursor.offset += bytesRead;

    const elements: DecodedValue[] = [];
    for (let i = 0; i < count; i++) {
      elements.push(decodeField(childSchema, data, cursor, limit));
    }
    return { tag: 'list', elements };
  }

  if (kind === BlueprintFieldKind.Struct) {
    const { value: fieldCount, bytesRead } = readPayloadCompactLength(
      data,
      cursor.offset,
    );
    cursor.offset += bytesRead;

    if (fieldCount !== schema.children.length) {
      throw new Error(
        `Struct field count mismatch: expected ${schema.children.length}, got ${fieldCount}`,
      );
    }

    const fields: NamedDecodedField[] = [];
    for (let i = 0; i < fieldCount; i++) {
      const childSchema = schema.children[i];
      const value = decodeField(childSchema, data, cursor, limit);
      fields.push({ name: childSchema.name, schema: childSchema, value });
    }
    return { tag: 'struct', fields };
  }

  throw new Error(`Unsupported field kind: ${kind}`);
};

/**
 * Attempts to decode the entire payload for the provided root schema.
 * Returns `null` on any structural mismatch or decode error.
 */
export const decodePayload = (
  schema: SchemaField[],
  payload: Uint8Array,
): NamedDecodedField[] | null => {
  if (schema.length === 0) {
    return null;
  }

  try {
    const cursor: DecodeCursor = { offset: 0 };
    const fields: NamedDecodedField[] = [];

    for (const fieldSchema of schema) {
      const value = decodeField(fieldSchema, payload, cursor, payload.length);
      fields.push({ name: fieldSchema.name, schema: fieldSchema, value });
    }

    // Validate full payload consumed
    if (cursor.offset !== payload.length) {
      return null;
    }

    return fields;
  } catch {
    return null;
  }
};

/**
 * Normalizes decoded addresses for stable display/comparison.
 * Full EIP-55 checksumming is intentionally not applied here.
 */
const toChecksumAddress = (address: string): string => {
  // Simple lowercase address for now; full EIP-55 would require keccak
  return address.toLowerCase();
};

export const formatDecodedValue = (decoded: DecodedValue): string => {
  switch (decoded.tag) {
    case 'void':
      return '(void)';
    case 'bool':
      return decoded.value ? 'true' : 'false';
    case 'number':
      return decoded.value.toString();
    case 'address':
      return decoded.value;
    case 'bytes32':
      return bytesToHex(decoded.value);
    case 'fixedBytes':
      return bytesToHex(decoded.value);
    case 'string':
      return decoded.value;
    case 'bytes':
      return bytesToHex(decoded.value);
    case 'optional':
      if (!decoded.present || !decoded.inner) {
        return '<none>';
      }
      return formatDecodedValue(decoded.inner);
    case 'array':
    case 'list':
      return `[${decoded.elements.map(formatDecodedValue).join(', ')}]`;
    case 'struct':
      return `{ ${decoded.fields.map((f) => `${f.name}: ${formatDecodedValue(f.value)}`).join(', ')} }`;
  }
};
