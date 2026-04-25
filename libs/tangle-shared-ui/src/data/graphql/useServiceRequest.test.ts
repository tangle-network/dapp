import {
  encodeAbiParameters,
  encodeEventTopics,
  toHex,
  zeroAddress,
} from 'viem';
import {
  BlueprintFieldKind,
  encodePayload,
  type FormFieldValue,
  type SchemaField,
} from '../../codec';
import type { PrimitiveFieldType } from '../../types/blueprint';
import { encodeServiceConfig } from './encodeServiceConfig';
import TangleABI from '../../abi/tangle';
import { extractServiceRequestIdFromLogs } from './extractServiceRequestIdFromLogs';
import {
  AssetKind,
  selectRequestFunction,
  validateServiceRequestParams,
  type ServiceRequestParams,
} from './useServiceRequest';

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  usePublicClient: jest.fn(),
  useWalletClient: jest.fn(),
}));

const operatorOne = '0x00000000000000000000000000000000000000a1';
const operatorTwo = '0x00000000000000000000000000000000000000a2';
const erc20Token = '0x00000000000000000000000000000000000000b1';

const buildBaseParams = (): ServiceRequestParams => ({
  blueprintId: 7n,
  operators: [operatorOne, operatorTwo],
  config: '0x',
  permittedCallers: [],
  ttl: 3600n,
  paymentToken: zeroAddress,
  paymentAmount: 0n,
});

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

  it('normalizes primitive bool and integer representations deterministically', () => {
    expect(encodeServiceConfig([true, 42], ['Bool', 'Uint32'])).toBe(
      encodeServiceConfig(['true', ' 42 '], ['Bool', 'Uint32']),
    );
  });

  it('encodes wrapped and plain optional/list/array/struct forms equivalently', () => {
    expect(encodeServiceConfig([null], [{ Optional: 'Uint16' }])).toBe(
      encodeServiceConfig([{ Optional: null }], [{ Optional: 'Uint16' }]),
    );

    expect(encodeServiceConfig([[1, 2, 3]], [{ List: 'Uint16' }])).toBe(
      encodeServiceConfig([{ List: [3, [1, 2, 3]] }], [{ List: 'Uint16' }]),
    );

    expect(encodeServiceConfig([[9, 8]], [{ Array: [2, 'Uint16'] }])).toBe(
      encodeServiceConfig([{ Array: [9, 8] }], [{ Array: [2, 'Uint16'] }]),
    );

    expect(
      encodeServiceConfig([['alpha', true]], [{ Struct: ['String', 'Bool'] }]),
    ).toBe(
      encodeServiceConfig(
        [{ Struct: ['alpha', 'true'] }],
        [{ Struct: ['String', 'Bool'] }],
      ),
    );
  });

  it('surfaces schema encoding validation failures with contextual error prefix', () => {
    expect(() => encodeServiceConfig(['not-bool'], ['Bool'])).toThrow(
      'Failed to encode request arguments against schema: Bool value must be true or false',
    );
  });

  it('throws when request arg count does not match schema', () => {
    const requestParamTypes: PrimitiveFieldType[] = ['String', 'Bool'];

    expect(() => encodeServiceConfig(['only-one'], requestParamTypes)).toThrow(
      'Request argument count mismatch',
    );
  });
});

describe('selectRequestFunction', () => {
  it('selects requestService when neither exposure nor security is provided', () => {
    expect(selectRequestFunction(buildBaseParams())).toBe('requestService');
  });

  it('selects requestServiceWithExposure when exposure commitments are provided', () => {
    expect(
      selectRequestFunction({
        ...buildBaseParams(),
        exposureBps: [100, 200],
      }),
    ).toBe('requestServiceWithExposure');
  });

  it('selects requestServiceWithSecurity when security requirements are provided', () => {
    expect(
      selectRequestFunction({
        ...buildBaseParams(),
        securityRequirements: [
          {
            asset: { kind: AssetKind.Native, token: zeroAddress },
            minExposureBps: 100,
            maxExposureBps: 1_000,
          },
        ],
      }),
    ).toBe('requestServiceWithSecurity');
  });

  it('prefers security request function when both arrays are populated', () => {
    expect(
      selectRequestFunction({
        ...buildBaseParams(),
        exposureBps: [100, 200],
        securityRequirements: [
          {
            asset: { kind: AssetKind.ERC20, token: erc20Token },
            minExposureBps: 100,
            maxExposureBps: 1_000,
          },
        ],
      }),
    ).toBe('requestServiceWithSecurity');
  });
});

describe('validateServiceRequestParams', () => {
  it('accepts valid plain request params', () => {
    expect(() => validateServiceRequestParams(buildBaseParams())).not.toThrow();
  });

  it('accepts valid exposure commitments when length matches operators', () => {
    expect(() =>
      validateServiceRequestParams({
        ...buildBaseParams(),
        exposureBps: [1, 10_000],
      }),
    ).not.toThrow();
  });

  it('accepts valid security requirements', () => {
    expect(() =>
      validateServiceRequestParams({
        ...buildBaseParams(),
        securityRequirements: [
          {
            asset: { kind: AssetKind.Native, token: zeroAddress },
            minExposureBps: 100,
            maxExposureBps: 100,
          },
          {
            asset: { kind: AssetKind.ERC20, token: erc20Token },
            minExposureBps: 250,
            maxExposureBps: 900,
          },
        ],
      }),
    ).not.toThrow();
  });

  it('rejects simultaneous exposure commitments and security requirements', () => {
    expect(() =>
      validateServiceRequestParams({
        ...buildBaseParams(),
        exposureBps: [100, 200],
        securityRequirements: [
          {
            asset: { kind: AssetKind.Native, token: zeroAddress },
            minExposureBps: 100,
            maxExposureBps: 500,
          },
        ],
      }),
    ).toThrow(
      'Exposure commitments and security requirements are mutually exclusive',
    );
  });

  it('rejects exposure commitment length mismatch', () => {
    expect(() =>
      validateServiceRequestParams({
        ...buildBaseParams(),
        exposureBps: [500],
      }),
    ).toThrow('Exposure commitments length mismatch: expected 2, got 1');
  });

  it('rejects non-integer exposure commitments', () => {
    expect(() =>
      validateServiceRequestParams({
        ...buildBaseParams(),
        exposureBps: [100, 99.5],
      }),
    ).toThrow('Exposure commitment at index 1 must be an integer');
  });

  it('rejects out-of-range exposure commitments', () => {
    expect(() =>
      validateServiceRequestParams({
        ...buildBaseParams(),
        exposureBps: [0, 500],
      }),
    ).toThrow('Exposure commitment at index 0 must be between 1 and 10000 bps');
  });

  it('rejects non-integer security exposures', () => {
    expect(() =>
      validateServiceRequestParams({
        ...buildBaseParams(),
        securityRequirements: [
          {
            asset: { kind: AssetKind.Native, token: zeroAddress },
            minExposureBps: 1.1,
            maxExposureBps: 100,
          },
        ],
      }),
    ).toThrow(
      'Security requirement at index 0 must use integer exposure values',
    );
  });

  it('rejects out-of-range security exposures', () => {
    expect(() =>
      validateServiceRequestParams({
        ...buildBaseParams(),
        securityRequirements: [
          {
            asset: { kind: AssetKind.ERC20, token: erc20Token },
            minExposureBps: 100,
            maxExposureBps: 10_001,
          },
        ],
      }),
    ).toThrow(
      'Security requirement at index 0 must be between 1 and 10000 bps',
    );
  });

  it('rejects security requirements where min exceeds max', () => {
    expect(() =>
      validateServiceRequestParams({
        ...buildBaseParams(),
        securityRequirements: [
          {
            asset: { kind: AssetKind.ERC20, token: erc20Token },
            minExposureBps: 700,
            maxExposureBps: 600,
          },
        ],
      }),
    ).toThrow(
      'Security requirement at index 0 has minExposureBps greater than maxExposureBps',
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
    const data = encodeAbiParameters([{ type: 'uint8' }], [0]);

    return [
      {
        address: requester,
        topics,
        data,
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
