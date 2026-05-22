// Hand-written ABI fragment for the blueprint binary upgrade flow on the
// Tangle facet. This file is intentionally separate from `tangle.ts`
// (which is auto-generated from tnt-core) so that the next bindings
// regeneration can drop these into the main ABI without surprises.
//
// Covers two mixins shipped in tnt-core feat/blueprint-binary-versions:
//   - BlueprintsBinaryVersions (publish / setActive / deprecate /
//     setServiceUpgradePolicy / ackBinaryVersion + views)
//   - BlueprintsBinaryAttestations (attest / revoke + views)
//
// Address-wise, every entry resolves through the same Tangle facet
// address as the existing blueprint reads. Once the auto-gen bindings
// catch up, callers can flip their imports back to `./tangle` without
// changing function names or arg shapes.

const ABI = [
  // ──────────────────────────────────────────────────────────────
  // VIEWS — BlueprintsBinaryVersions
  // ──────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'getBinaryVersionCount',
    inputs: [{ name: 'blueprintId', type: 'uint64', internalType: 'uint64' }],
    outputs: [{ name: '', type: 'uint64', internalType: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getBinaryVersion',
    inputs: [
      { name: 'blueprintId', type: 'uint64', internalType: 'uint64' },
      { name: 'versionId', type: 'uint64', internalType: 'uint64' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.BinaryVersion',
        components: [
          { name: 'versionId', type: 'uint64', internalType: 'uint64' },
          { name: 'sha256Hash', type: 'bytes32', internalType: 'bytes32' },
          { name: 'binaryUri', type: 'string', internalType: 'string' },
          { name: 'attestationHash', type: 'bytes32', internalType: 'bytes32' },
          { name: 'publishedAt', type: 'uint64', internalType: 'uint64' },
          { name: 'deprecated', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getActiveBinaryVersionId',
    inputs: [{ name: 'blueprintId', type: 'uint64', internalType: 'uint64' }],
    outputs: [{ name: '', type: 'uint64', internalType: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'effectiveBinaryVersion',
    inputs: [{ name: 'serviceId', type: 'uint64', internalType: 'uint64' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.BinaryVersion',
        components: [
          { name: 'versionId', type: 'uint64', internalType: 'uint64' },
          { name: 'sha256Hash', type: 'bytes32', internalType: 'bytes32' },
          { name: 'binaryUri', type: 'string', internalType: 'string' },
          { name: 'attestationHash', type: 'bytes32', internalType: 'bytes32' },
          { name: 'publishedAt', type: 'uint64', internalType: 'uint64' },
          { name: 'deprecated', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getServiceUpgradePolicy',
    inputs: [{ name: 'serviceId', type: 'uint64', internalType: 'uint64' }],
    outputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'enum Types.UpgradePolicy',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getServiceAckedVersionId',
    inputs: [{ name: 'serviceId', type: 'uint64', internalType: 'uint64' }],
    outputs: [{ name: '', type: 'uint64', internalType: 'uint64' }],
    stateMutability: 'view',
  },

  // ──────────────────────────────────────────────────────────────
  // WRITES — BlueprintsBinaryVersions
  // ──────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'publishBinaryVersion',
    inputs: [
      { name: 'blueprintId', type: 'uint64', internalType: 'uint64' },
      { name: 'sha256Hash', type: 'bytes32', internalType: 'bytes32' },
      { name: 'binaryUri', type: 'string', internalType: 'string' },
      { name: 'attestationHash', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [{ name: 'versionId', type: 'uint64', internalType: 'uint64' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setActiveBinaryVersion',
    inputs: [
      { name: 'blueprintId', type: 'uint64', internalType: 'uint64' },
      { name: 'versionId', type: 'uint64', internalType: 'uint64' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deprecateBinaryVersion',
    inputs: [
      { name: 'blueprintId', type: 'uint64', internalType: 'uint64' },
      { name: 'versionId', type: 'uint64', internalType: 'uint64' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setServiceUpgradePolicy',
    inputs: [
      { name: 'serviceId', type: 'uint64', internalType: 'uint64' },
      {
        name: 'policy',
        type: 'uint8',
        internalType: 'enum Types.UpgradePolicy',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'ackBinaryVersion',
    inputs: [
      { name: 'serviceId', type: 'uint64', internalType: 'uint64' },
      { name: 'versionId', type: 'uint64', internalType: 'uint64' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ──────────────────────────────────────────────────────────────
  // VIEWS — BlueprintsBinaryAttestations
  // ──────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'getAttestationCount',
    inputs: [
      { name: 'blueprintId', type: 'uint64', internalType: 'uint64' },
      { name: 'versionId', type: 'uint64', internalType: 'uint64' },
    ],
    outputs: [{ name: '', type: 'uint64', internalType: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAttestation',
    inputs: [
      { name: 'blueprintId', type: 'uint64', internalType: 'uint64' },
      { name: 'versionId', type: 'uint64', internalType: 'uint64' },
      { name: 'attestationId', type: 'uint64', internalType: 'uint64' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.Attestation',
        components: [
          { name: 'attester', type: 'address', internalType: 'address' },
          { name: 'reportHash', type: 'bytes32', internalType: 'bytes32' },
          { name: 'reportUri', type: 'string', internalType: 'string' },
          {
            name: 'kind',
            type: 'uint8',
            internalType: 'enum Types.AttestationKind',
          },
          { name: 'severityFound', type: 'uint8', internalType: 'uint8' },
          { name: 'attestedAt', type: 'uint64', internalType: 'uint64' },
          { name: 'expiresAt', type: 'uint64', internalType: 'uint64' },
          { name: 'revoked', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'listAttestations',
    inputs: [
      { name: 'blueprintId', type: 'uint64', internalType: 'uint64' },
      { name: 'versionId', type: 'uint64', internalType: 'uint64' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct Types.Attestation[]',
        components: [
          { name: 'attester', type: 'address', internalType: 'address' },
          { name: 'reportHash', type: 'bytes32', internalType: 'bytes32' },
          { name: 'reportUri', type: 'string', internalType: 'string' },
          {
            name: 'kind',
            type: 'uint8',
            internalType: 'enum Types.AttestationKind',
          },
          { name: 'severityFound', type: 'uint8', internalType: 'uint8' },
          { name: 'attestedAt', type: 'uint64', internalType: 'uint64' },
          { name: 'expiresAt', type: 'uint64', internalType: 'uint64' },
          { name: 'revoked', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },

  // ──────────────────────────────────────────────────────────────
  // WRITES — BlueprintsBinaryAttestations
  // ──────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'attestBinaryVersion',
    inputs: [
      { name: 'blueprintId', type: 'uint64', internalType: 'uint64' },
      { name: 'versionId', type: 'uint64', internalType: 'uint64' },
      { name: 'reportHash', type: 'bytes32', internalType: 'bytes32' },
      { name: 'reportUri', type: 'string', internalType: 'string' },
      {
        name: 'kind',
        type: 'uint8',
        internalType: 'enum Types.AttestationKind',
      },
      { name: 'severityFound', type: 'uint8', internalType: 'uint8' },
      { name: 'expiresAt', type: 'uint64', internalType: 'uint64' },
    ],
    outputs: [
      { name: 'attestationId', type: 'uint64', internalType: 'uint64' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeAttestation',
    inputs: [
      { name: 'blueprintId', type: 'uint64', internalType: 'uint64' },
      { name: 'versionId', type: 'uint64', internalType: 'uint64' },
      { name: 'attestationId', type: 'uint64', internalType: 'uint64' },
      { name: 'reasonUri', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ──────────────────────────────────────────────────────────────
  // EVENTS — kept here so transaction receipts can decode their logs
  // ──────────────────────────────────────────────────────────────
  {
    type: 'event',
    name: 'BinaryVersionPublished',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'versionId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'sha256Hash',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'binaryUri',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BinaryVersionDeprecated',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'versionId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BinaryActiveVersionChanged',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'versionId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ServiceUpgradePolicySet',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'policy',
        type: 'uint8',
        indexed: false,
        internalType: 'enum Types.UpgradePolicy',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorBinaryAcked',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'versionId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BinaryVersionAttested',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'versionId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'attestationId',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
      {
        name: 'attester',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'kind',
        type: 'uint8',
        indexed: false,
        internalType: 'enum Types.AttestationKind',
      },
      {
        name: 'severityFound',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'reportUri',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BinaryVersionAttestationRevoked',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'versionId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'attestationId',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
      {
        name: 'reasonUri',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
] as const;

export default ABI;
