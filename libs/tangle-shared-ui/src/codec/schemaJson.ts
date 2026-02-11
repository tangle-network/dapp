/**
 * Parse JSON schema definitions and encode them to TLV v2 schema bytes.
 * This format mirrors SchemaLib.encodeSchema in tnt-core.
 */

import { BlueprintFieldKind, type SchemaField } from './types';

const SCHEMA_VERSION = 0x02;
const MAX_UINT16 = 0xffff;

type JsonSchemaNode = {
  kind: string | number;
  name?: string;
  arrayLength?: number;
  children?: JsonSchemaNode[];
};

const KIND_BY_LOWER_NAME: Record<string, BlueprintFieldKind> = {
  void: BlueprintFieldKind.Void,
  bool: BlueprintFieldKind.Bool,
  uint8: BlueprintFieldKind.Uint8,
  int8: BlueprintFieldKind.Int8,
  uint16: BlueprintFieldKind.Uint16,
  int16: BlueprintFieldKind.Int16,
  uint32: BlueprintFieldKind.Uint32,
  int32: BlueprintFieldKind.Int32,
  uint64: BlueprintFieldKind.Uint64,
  int64: BlueprintFieldKind.Int64,
  uint128: BlueprintFieldKind.Uint128,
  int128: BlueprintFieldKind.Int128,
  uint256: BlueprintFieldKind.Uint256,
  int256: BlueprintFieldKind.Int256,
  address: BlueprintFieldKind.Address,
  bytes32: BlueprintFieldKind.Bytes32,
  fixedbytes: BlueprintFieldKind.FixedBytes,
  string: BlueprintFieldKind.String,
  bytes: BlueprintFieldKind.Bytes,
  optional: BlueprintFieldKind.Optional,
  array: BlueprintFieldKind.Array,
  list: BlueprintFieldKind.List,
  struct: BlueprintFieldKind.Struct,
};

const ensure = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const resolveKind = (kind: JsonSchemaNode['kind'], path: string): BlueprintFieldKind => {
  if (typeof kind === 'number') {
    ensure(
      Number.isInteger(kind) &&
        kind >= BlueprintFieldKind.Void &&
        kind <= BlueprintFieldKind.Struct,
      `${path}.kind must be an integer between 0 and ${BlueprintFieldKind.Struct}`,
    );
    return kind as BlueprintFieldKind;
  }

  ensure(typeof kind === 'string' && kind.length > 0, `${path}.kind is required`);

  const direct = (BlueprintFieldKind as unknown as Record<string, number>)[kind];
  if (typeof direct === 'number') {
    return direct as BlueprintFieldKind;
  }

  const byLowerName = KIND_BY_LOWER_NAME[kind.toLowerCase()];
  if (byLowerName !== undefined) {
    return byLowerName;
  }

  throw new Error(`${path}.kind "${kind}" is unsupported`);
};

const parseNode = (node: unknown, path: string): SchemaField => {
  ensure(
    !!node && typeof node === 'object' && !Array.isArray(node),
    `${path} must be an object`,
  );

  const raw = node as JsonSchemaNode;
  const kind = resolveKind(raw.kind, path);
  const name = typeof raw.name === 'string' ? raw.name : '';
  const arrayLength = raw.arrayLength ?? 0;
  const rawChildren = raw.children ?? [];

  ensure(
    Number.isInteger(arrayLength) && arrayLength >= 0 && arrayLength <= MAX_UINT16,
    `${path}.arrayLength must be an integer between 0 and ${MAX_UINT16}`,
  );
  ensure(Array.isArray(rawChildren), `${path}.children must be an array`);
  ensure(
    rawChildren.length <= MAX_UINT16,
    `${path}.children cannot exceed ${MAX_UINT16} entries`,
  );

  return {
    kind,
    name,
    arrayLength,
    children: rawChildren.map((child, i) => parseNode(child, `${path}.children[${i}]`)),
  };
};

const writeUint16BE = (out: number[], value: number): void => {
  out.push((value >> 8) & 0xff, value & 0xff);
};

const writeSchemaCompactLength = (out: number[], value: number): void => {
  ensure(
    Number.isInteger(value) && value >= 0,
    'Compact length must be a non-negative integer',
  );

  if (value < 0x80) {
    out.push(value);
    return;
  }
  if (value < 0x4000) {
    out.push(0x80 | (value >> 8), value & 0xff);
    return;
  }
  if (value < 0x200000) {
    out.push(0xc0 | (value >> 16), (value >> 8) & 0xff, value & 0xff);
    return;
  }
  ensure(value <= 0x0fffffff, 'Compact length exceeds 4-byte schema encoding limit');
  out.push(
    0xe0 | (value >> 24),
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  );
};

const writeField = (out: number[], field: SchemaField, path: string): void => {
  ensure(
    field.children.length <= MAX_UINT16,
    `${path}.children cannot exceed ${MAX_UINT16} entries`,
  );

  out.push(field.kind);
  writeUint16BE(out, field.arrayLength);
  writeUint16BE(out, field.children.length);

  const nameBytes = new TextEncoder().encode(field.name ?? '');
  writeSchemaCompactLength(out, nameBytes.length);
  out.push(...nameBytes);

  field.children.forEach((child, i) => writeField(out, child, `${path}.children[${i}]`));
};

const bytesToHex = (bytes: Uint8Array): `0x${string}` =>
  `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;

export const parseSchemaJson = (schemaJson: string): SchemaField[] => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(schemaJson);
  } catch (error) {
    throw new Error(
      `Schema must be valid JSON: ${error instanceof Error ? error.message : 'parse failed'}`,
    );
  }

  ensure(Array.isArray(parsed), 'Schema root must be an array of field definitions');
  const parsedArray = parsed as unknown[];
  ensure(
    parsedArray.length <= MAX_UINT16,
    `Schema cannot exceed ${MAX_UINT16} root fields`,
  );

  return parsedArray.map((node: unknown, i: number) =>
    parseNode(node, `schema[${i}]`),
  );
};

export const encodeSchemaToHex = (fields: SchemaField[]): `0x${string}` => {
  if (fields.length === 0) {
    return '0x';
  }

  const out: number[] = [SCHEMA_VERSION];
  writeUint16BE(out, fields.length);
  fields.forEach((field, i) => writeField(out, field, `schema[${i}]`));

  return bytesToHex(new Uint8Array(out));
};

export const encodeSchemaFromJson = (schemaJson: string): `0x${string}` => {
  const fields = parseSchemaJson(schemaJson);
  return encodeSchemaToHex(fields);
};
