/**
 * Parse TLV v2 schema hex to a field tree.
 *
 * Schema binary format:
 *   [version: 1 byte = 0x02]
 *   [fieldCount: 2 bytes BE]
 *   for each field:
 *     [kind: 1 byte][arrayLength: 2 bytes BE][childCount: 2 bytes BE]  (5-byte header)
 *     [schema-compact-length-prefixed name string]
 *     [children...]  (recursively, childCount times)
 *
 * Reference: SchemaLib.sol:558-584
 */

import { readSchemaCompactLength } from './compactLength';
import { BlueprintFieldKind, type SchemaField } from './types';

const SCHEMA_VERSION = 0x02;
const NODE_HEADER_SIZE = 5;

const hexToBytes = (hex: string): Uint8Array => {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (cleaned.length === 0) {
    return new Uint8Array(0);
  }
  if (cleaned.length % 2 !== 0) {
    throw new Error('Invalid hex string: odd length');
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

interface ParseCursor {
  offset: number;
}

const readUint16BE = (data: Uint8Array, offset: number): number => {
  return (data[offset] << 8) | data[offset + 1];
};

const readField = (data: Uint8Array, cursor: ParseCursor): SchemaField => {
  if (cursor.offset + NODE_HEADER_SIZE > data.length) {
    throw new Error(
      `Schema truncated at offset ${cursor.offset}: expected ${NODE_HEADER_SIZE}-byte header`,
    );
  }

  const kind = data[cursor.offset] as BlueprintFieldKind;
  if (kind > BlueprintFieldKind.Struct) {
    throw new Error(`Unknown field kind: ${kind}`);
  }

  const arrayLength = readUint16BE(data, cursor.offset + 1);
  const childCount = readUint16BE(data, cursor.offset + 3);
  cursor.offset += NODE_HEADER_SIZE;

  // Read field name
  const { value: nameLen, bytesRead } = readSchemaCompactLength(
    data,
    cursor.offset,
  );
  cursor.offset += bytesRead;

  if (cursor.offset + nameLen > data.length) {
    throw new Error(
      `Schema truncated at offset ${cursor.offset}: expected ${nameLen}-byte name`,
    );
  }

  const nameBytes = data.slice(cursor.offset, cursor.offset + nameLen);
  const name = new TextDecoder().decode(nameBytes);
  cursor.offset += nameLen;

  // Read children recursively
  const children: SchemaField[] = [];
  for (let i = 0; i < childCount; i++) {
    children.push(readField(data, cursor));
  }

  return { kind, name, arrayLength, children };
};

export const parseSchema = (schemaHex: string): SchemaField[] => {
  if (!schemaHex || schemaHex === '0x' || schemaHex === '') {
    return [];
  }

  const data = hexToBytes(schemaHex);
  if (data.length === 0) {
    return [];
  }

  if (data.length < 3) {
    throw new Error(`Schema too short: ${data.length} bytes (minimum 3)`);
  }

  const version = data[0];
  if (version !== SCHEMA_VERSION) {
    throw new Error(
      `Invalid schema version: expected ${SCHEMA_VERSION}, got ${version}`,
    );
  }

  const fieldCount = readUint16BE(data, 1);
  const cursor: ParseCursor = { offset: 3 };

  const fields: SchemaField[] = [];
  for (let i = 0; i < fieldCount; i++) {
    fields.push(readField(data, cursor));
  }

  return fields;
};
