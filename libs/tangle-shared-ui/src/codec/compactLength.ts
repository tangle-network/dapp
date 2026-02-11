/**
 * Compact length encoding/decoding for TLV v2 schema and payload formats.
 *
 * Schema and payload use different compact length encodings.
 *
 * Schema compact length (field name lengths):
 *   0x00-0x7F → 1 byte
 *   0x80-0xBF → 2 bytes: ((first & 0x3F) << 8) | second
 *   0xC0-0xDF → 3 bytes: ((first & 0x1F) << 16) | ...
 *   0xE0-0xFF → 4 bytes: ((first & 0x0F) << 24) | ...
 *
 * Payload compact length (String/Bytes/Optional/List/Struct):
 *   0x00-0x7F → 1 byte
 *   0x80-0xBF → 2 bytes: ((first & 0x3F) << 8) | second
 *   0xC0-0xFF → lenLen = first & 0x3F, then read lenLen bytes big-endian
 *
 * Reference: SchemaLib.sol:586-637 (schema), SchemaLib.sol:658-706 (payload)
 */

export interface CompactLengthResult {
  value: number;
  bytesRead: number;
}

export const readSchemaCompactLength = (
  data: Uint8Array,
  offset: number,
): CompactLengthResult => {
  if (offset >= data.length) {
    throw new Error(`Schema compact length: offset ${offset} out of bounds`);
  }

  const first = data[offset];

  if ((first & 0x80) === 0) {
    return { value: first, bytesRead: 1 };
  }

  if ((first & 0xc0) === 0x80) {
    if (offset + 1 >= data.length) {
      throw new Error('Schema compact length: truncated 2-byte encoding');
    }
    const value = ((first & 0x3f) << 8) | data[offset + 1];
    return { value, bytesRead: 2 };
  }

  if ((first & 0xe0) === 0xc0) {
    if (offset + 2 >= data.length) {
      throw new Error('Schema compact length: truncated 3-byte encoding');
    }
    const value =
      ((first & 0x1f) << 16) | (data[offset + 1] << 8) | data[offset + 2];
    return { value, bytesRead: 3 };
  }

  // 0xE0-0xFF: 4-byte encoding
  if (offset + 3 >= data.length) {
    throw new Error('Schema compact length: truncated 4-byte encoding');
  }
  const value =
    ((first & 0x0f) << 24) |
    (data[offset + 1] << 16) |
    (data[offset + 2] << 8) |
    data[offset + 3];
  return { value, bytesRead: 4 };
};

export const readPayloadCompactLength = (
  data: Uint8Array,
  offset: number,
): CompactLengthResult => {
  if (offset >= data.length) {
    throw new Error(`Payload compact length: offset ${offset} out of bounds`);
  }

  const first = data[offset];

  if ((first & 0x80) === 0) {
    return { value: first, bytesRead: 1 };
  }

  if ((first & 0xc0) === 0x80) {
    if (offset + 1 >= data.length) {
      throw new Error('Payload compact length: truncated 2-byte encoding');
    }
    const value = ((first & 0x3f) << 8) | data[offset + 1];
    return { value, bytesRead: 2 };
  }

  // 0xC0-0xFF: lenLen = first & 0x3F, then read lenLen bytes big-endian
  const lenLen = first & 0x3f;
  if (lenLen === 0 || lenLen > 32) {
    throw new Error(`Payload compact length: invalid lenLen ${lenLen}`);
  }
  if (offset + 1 + lenLen > data.length) {
    throw new Error('Payload compact length: truncated big-endian encoding');
  }

  let value = 0;
  for (let i = 0; i < lenLen; i++) {
    value = value * 256 + data[offset + 1 + i];
  }
  return { value, bytesRead: 1 + lenLen };
};

export const writePayloadCompactLength = (value: number): Uint8Array => {
  if (value < 0x80) {
    return new Uint8Array([value]);
  }

  if (value < 0x4000) {
    return new Uint8Array([0x80 | (value >> 8), value & 0xff]);
  }

  // For larger values, use the lenLen encoding
  // Determine how many bytes we need for the value
  const bytes: number[] = [];
  let temp = value;
  while (temp > 0) {
    bytes.unshift(temp & 0xff);
    temp = Math.floor(temp / 256);
  }

  const lenLen = bytes.length;
  if (lenLen > 32) {
    throw new Error(`Payload compact length: value too large`);
  }

  const result = new Uint8Array(1 + lenLen);
  result[0] = 0xc0 | lenLen;
  for (let i = 0; i < lenLen; i++) {
    result[1 + i] = bytes[i];
  }
  return result;
};
