/**
 * Encode form values to compact binary payload matching TLV v2 on-chain validation.
 *
 * Encoding rules per kind (matching SchemaLib._validateField, lines 280-388):
 *   Void        → 0 bytes
 *   Bool        → 1 byte: 0x00/0x01
 *   Uint8/Int8  → 1 byte big-endian (two's complement for signed)
 *   Uint16/Int16→ 2 bytes BE
 *   Uint32/Int32→ 4 bytes BE
 *   Uint64/Int64→ 8 bytes BE
 *   Uint128/Int128 → 16 bytes BE
 *   Uint256/Int256 → 32 bytes BE
 *   Address     → 20 bytes
 *   Bytes32     → 32 bytes
 *   FixedBytes  → arrayLength bytes
 *   String/Bytes→ compact_length + data
 *   Optional    → compact_length=0 if absent; compact_length(innerLen) + inner if present
 *   Array       → elements concatenated (count from schema arrayLength, NO length prefix)
 *   List        → compact_count + elements
 *   Struct      → compact_field_count + fields in order
 */

import { writePayloadCompactLength } from './compactLength';
import {
  BlueprintFieldKind,
  type FormFieldValue,
  type SchemaField,
} from './types';

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

const isUnsignedInt = (kind: BlueprintFieldKind): boolean => {
  return (
    kind === BlueprintFieldKind.Uint8 ||
    kind === BlueprintFieldKind.Uint16 ||
    kind === BlueprintFieldKind.Uint32 ||
    kind === BlueprintFieldKind.Uint64 ||
    kind === BlueprintFieldKind.Uint128 ||
    kind === BlueprintFieldKind.Uint256
  );
};

const toBigInt = (value: FormFieldValue): bigint => {
  if (typeof value === 'bigint') {
    return value;
  }
  if (typeof value === 'string') {
    return BigInt(value);
  }
  if (typeof value === 'number') {
    return BigInt(value);
  }
  throw new Error(`Cannot convert ${typeof value} to bigint`);
};

const hexToBytes = (hex: string): Uint8Array => {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (cleaned.length % 2 !== 0) {
    throw new Error('Invalid hex: odd length');
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

const encodeBigIntBE = (
  value: bigint,
  byteSize: number,
  signed: boolean,
): Uint8Array => {
  const result = new Uint8Array(byteSize);
  const totalBits = BigInt(byteSize * 8);

  let n = value;
  if (signed && n < BigInt(0)) {
    // Two's complement
    n = (BigInt(1) << totalBits) + n;
  }

  for (let i = byteSize - 1; i >= 0; i--) {
    result[i] = Number(n & BigInt(0xff));
    n >>= BigInt(8);
  }

  return result;
};

const encodeField = (
  schema: SchemaField,
  value: FormFieldValue,
): Uint8Array => {
  const { kind } = schema;

  if (kind === BlueprintFieldKind.Void) {
    return new Uint8Array(0);
  }

  if (kind === BlueprintFieldKind.Bool) {
    return new Uint8Array([value ? 0x01 : 0x00]);
  }

  // Fixed-size integers (Uint8..Int256)
  if (isSigned(kind) || isUnsignedInt(kind)) {
    const fixedSize = FIXED_SIZE_MAP[kind];
    if (fixedSize !== undefined) {
      const n = toBigInt(value);
      return encodeBigIntBE(n, fixedSize, isSigned(kind));
    }
  }

  if (kind === BlueprintFieldKind.Address) {
    if (typeof value !== 'string') {
      throw new Error('Address must be a hex string');
    }
    const bytes = hexToBytes(value);
    if (bytes.length !== 20) {
      throw new Error(`Address must be 20 bytes, got ${bytes.length}`);
    }
    return bytes;
  }

  if (kind === BlueprintFieldKind.Bytes32) {
    const bytes =
      value instanceof Uint8Array ? value : hexToBytes(value as string);
    if (bytes.length !== 32) {
      throw new Error(`Bytes32 must be 32 bytes, got ${bytes.length}`);
    }
    return bytes;
  }

  if (kind === BlueprintFieldKind.FixedBytes) {
    const bytes =
      value instanceof Uint8Array ? value : hexToBytes(value as string);
    if (bytes.length !== schema.arrayLength) {
      throw new Error(
        `FixedBytes must be ${schema.arrayLength} bytes, got ${bytes.length}`,
      );
    }
    return bytes;
  }

  if (kind === BlueprintFieldKind.String) {
    const strBytes = new TextEncoder().encode(value as string);
    const lenPrefix = writePayloadCompactLength(strBytes.length);
    const result = new Uint8Array(lenPrefix.length + strBytes.length);
    result.set(lenPrefix);
    result.set(strBytes, lenPrefix.length);
    return result;
  }

  if (kind === BlueprintFieldKind.Bytes) {
    const bytes =
      value instanceof Uint8Array ? value : hexToBytes(value as string);
    const lenPrefix = writePayloadCompactLength(bytes.length);
    const result = new Uint8Array(lenPrefix.length + bytes.length);
    result.set(lenPrefix);
    result.set(bytes, lenPrefix.length);
    return result;
  }

  if (kind === BlueprintFieldKind.Optional) {
    const optVal = value as {
      present: boolean;
      inner?: FormFieldValue;
    } | null;

    if (!optVal || !optVal.present) {
      // Absent: compact_length = 0
      return writePayloadCompactLength(0);
    }

    // Present: encode inner value, then wrap with compact_length
    const childSchema = schema.children[0];
    if (!childSchema) {
      throw new Error('Optional field must have exactly 1 child schema');
    }
    const innerEncoded = encodeField(childSchema, optVal.inner ?? null);
    const lenPrefix = writePayloadCompactLength(innerEncoded.length);
    const result = new Uint8Array(lenPrefix.length + innerEncoded.length);
    result.set(lenPrefix);
    result.set(innerEncoded, lenPrefix.length);
    return result;
  }

  if (kind === BlueprintFieldKind.Array) {
    // Fixed-count elements, NO length prefix
    const childSchema = schema.children[0];
    if (!childSchema) {
      throw new Error('Array field must have exactly 1 child schema');
    }
    const elements = value as FormFieldValue[];
    if (elements.length !== schema.arrayLength) {
      throw new Error(
        `Array expects ${schema.arrayLength} elements, got ${elements.length}`,
      );
    }
    const parts = elements.map((el) => encodeField(childSchema, el));
    return concatBytes(parts);
  }

  if (kind === BlueprintFieldKind.List) {
    // compact_count + elements
    const childSchema = schema.children[0];
    if (!childSchema) {
      throw new Error('List field must have exactly 1 child schema');
    }
    const elements = value as FormFieldValue[];
    const countPrefix = writePayloadCompactLength(elements.length);
    const parts = elements.map((el) => encodeField(childSchema, el));
    return concatBytes([countPrefix, ...parts]);
  }

  if (kind === BlueprintFieldKind.Struct) {
    // compact_field_count + fields in order
    const fields = value as FormFieldValue[];
    const countPrefix = writePayloadCompactLength(schema.children.length);
    const parts = schema.children.map((child, i) =>
      encodeField(child, fields[i] ?? null),
    );
    return concatBytes([countPrefix, ...parts]);
  }

  throw new Error(`Unsupported field kind: ${kind}`);
};

const concatBytes = (arrays: Uint8Array[]): Uint8Array => {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};

export const encodePayload = (
  schema: SchemaField[],
  values: FormFieldValue[],
): Uint8Array => {
  if (schema.length === 0) {
    return new Uint8Array(0);
  }

  const parts = schema.map((field, i) => encodeField(field, values[i] ?? null));
  return concatBytes(parts);
};
