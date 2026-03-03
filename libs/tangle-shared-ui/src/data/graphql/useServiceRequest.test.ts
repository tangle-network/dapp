import { encodeEventTopics, toHex } from 'viem';
import {
  BlueprintFieldKind,
  encodePayload,
  type FormFieldValue,
  type SchemaField,
} from '../../codec';
import type { PrimitiveFieldType } from '../../types/blueprint';
import { encodeServiceConfig } from './encodeServiceConfig';
import TangleABI from '../../abi/tangle';
import { extractServiceRequestIdFromLogs } from './useServiceRequest';

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

describe('extractServiceRequestIdFromLogs', () => {
  const requester = '0x0000000000000000000000000000000000000001';
  const eventLogs = (
    eventName: 'ServiceRequested' | 'ServiceRequestedWithSecurity',
    requestId: bigint,
  ) => {
    const topics = encodeEventTopics({
      abi: TangleABI,
      eventName,
      args: {
        requestId,
        blueprintId: 7n,
        requester,
      },
    });

    return [
      {
        address: requester,
        topics,
        data: '0x',
      },
    ] as const;
  };

  it('extracts requestId from ServiceRequested logs', () => {
    expect(
      extractServiceRequestIdFromLogs(eventLogs('ServiceRequested', 11n)),
    ).toBe(11n);
  });

  it('extracts requestId from ServiceRequestedWithSecurity logs', () => {
    expect(
      extractServiceRequestIdFromLogs(
        eventLogs('ServiceRequestedWithSecurity', 22n),
      ),
    ).toBe(22n);
  });

  it('returns undefined when neither request event is present', () => {
    expect(
      extractServiceRequestIdFromLogs([
        {
          address: requester,
          topics: [],
          data: '0x',
        },
      ]),
    ).toBeUndefined();
  });
});
