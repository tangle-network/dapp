import { toHex } from 'viem';
import {
  BlueprintFieldKind,
  encodePayload,
  type FormFieldValue,
  type SchemaField,
} from '../../codec';
import type { PrimitiveFieldType } from '../../types/blueprint';
import { encodeServiceConfig } from './encodeServiceConfig';

describe('encodeServiceConfig', () => {
  it('returns empty bytes when no request args are provided', () => {
    expect(encodeServiceConfig([])).toBe('0x');
  });

  it('falls back to JSON bytes when schema is not provided', () => {
    const args = ['hello', 42, true];
    const expected = toHex(new TextEncoder().encode(JSON.stringify(args)));

    expect(encodeServiceConfig(args)).toBe(expected);
  });

  it('encodes request args with TLV payload codec when schema exists', () => {
    const requestParamTypes: PrimitiveFieldType[] = [
      'String',
      'Bool',
      'Uint32',
    ];
    const args: unknown[] = ['hello', true, '42'];

    const schema: SchemaField[] = [
      {
        kind: BlueprintFieldKind.String,
        name: 'request_0',
        arrayLength: 0,
        children: [],
      },
      {
        kind: BlueprintFieldKind.Bool,
        name: 'request_1',
        arrayLength: 0,
        children: [],
      },
      {
        kind: BlueprintFieldKind.Uint32,
        name: 'request_2',
        arrayLength: 0,
        children: [],
      },
    ];

    const values: FormFieldValue[] = ['hello', true, '42'];
    const expected = toHex(encodePayload(schema, values));
    const legacyJson = toHex(new TextEncoder().encode(JSON.stringify(args)));

    expect(encodeServiceConfig(args, requestParamTypes)).toBe(expected);
    expect(encodeServiceConfig(args, requestParamTypes)).not.toBe(legacyJson);
  });

  it('encodes request args with parsed schema fields directly', () => {
    const args: unknown[] = ['hello', true];
    const parsedSchema: SchemaField[] = [
      {
        kind: BlueprintFieldKind.String,
        name: 'name',
        arrayLength: 0,
        children: [],
      },
      {
        kind: BlueprintFieldKind.Bool,
        name: 'enabled',
        arrayLength: 0,
        children: [],
      },
    ];

    const expected = toHex(encodePayload(parsedSchema, ['hello', true]));
    expect(encodeServiceConfig(args, parsedSchema)).toBe(expected);
  });

  it('supports struct and optional request args', () => {
    const requestParamTypes: PrimitiveFieldType[] = [
      {
        Struct: ['String', { Optional: 'Uint16' }],
      },
    ];

    const args: unknown[] = [
      [
        'operator-a',
        {
          Optional: 7,
        },
      ],
    ];

    const schema: SchemaField[] = [
      {
        kind: BlueprintFieldKind.Struct,
        name: 'request_0',
        arrayLength: 0,
        children: [
          {
            kind: BlueprintFieldKind.String,
            name: 'request_0_0',
            arrayLength: 0,
            children: [],
          },
          {
            kind: BlueprintFieldKind.Optional,
            name: 'request_0_1',
            arrayLength: 0,
            children: [
              {
                kind: BlueprintFieldKind.Uint16,
                name: 'request_0_1_opt',
                arrayLength: 0,
                children: [],
              },
            ],
          },
        ],
      },
    ];

    const values: FormFieldValue[] = [
      ['operator-a', { present: true, inner: '7' }],
    ];

    const expected = toHex(encodePayload(schema, values));

    expect(encodeServiceConfig(args, requestParamTypes)).toBe(expected);
  });

  it('throws when request arg count does not match schema', () => {
    const requestParamTypes: PrimitiveFieldType[] = ['String', 'Bool'];

    expect(() => encodeServiceConfig(['only-one'], requestParamTypes)).toThrow(
      'Request argument count mismatch',
    );
  });
});
