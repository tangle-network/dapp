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

// ────────────────────────────────────────────────────────────────────────────
// tnt-core 0.19 read variants
//
// The 0.19 "hash+emit shrink" dropped the URI blobs from on-chain STORAGE:
// `Types.BinaryVersion` no longer carries `binaryUri`, and `Types.Attestation`
// no longer carries `reportUri`. The URIs are now event-sourced
// (`BinaryVersionPublished.binaryUri`, `BinaryVersionAttested.reportUri`).
//
// The WRITE surface is unchanged — `publishBinaryVersion` / `attestBinaryVersion`
// still take the URI as a calldata param — so only these read tuples differ.
// Decoding a 0.18 (URI-bearing) tuple against 0.19 returndata mis-aligns every
// field after the dropped slot, so v019 chains MUST decode with these shorter
// tuples. Selection is keyed by the per-chain `TntCoreRevision`.
// ────────────────────────────────────────────────────────────────────────────

const BINARY_VERSION_V019_COMPONENTS = [
  { name: 'versionId', type: 'uint64', internalType: 'uint64' },
  { name: 'sha256Hash', type: 'bytes32', internalType: 'bytes32' },
  { name: 'attestationHash', type: 'bytes32', internalType: 'bytes32' },
  { name: 'publishedAt', type: 'uint64', internalType: 'uint64' },
  { name: 'deprecated', type: 'bool', internalType: 'bool' },
] as const;

const ATTESTATION_V019_COMPONENTS = [
  { name: 'attester', type: 'address', internalType: 'address' },
  { name: 'reportHash', type: 'bytes32', internalType: 'bytes32' },
  { name: 'kind', type: 'uint8', internalType: 'enum Types.AttestationKind' },
  { name: 'severityFound', type: 'uint8', internalType: 'uint8' },
  { name: 'attestedAt', type: 'uint64', internalType: 'uint64' },
  { name: 'expiresAt', type: 'uint64', internalType: 'uint64' },
  { name: 'revoked', type: 'bool', internalType: 'bool' },
] as const;

/**
 * 0.19 read-only fragment for binary versions + attestations. Same function
 * names and inputs as the 0.18 ABI above; only the returned struct tuples are
 * shorter (the URI slots are gone). Use this ABI for the on-chain READ path on
 * v019 chains; keep the default `ABI` for the WRITE path and for 0.18 reads.
 */
export const BINARY_UPGRADE_V019_READ_ABI = [
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
        components: BINARY_VERSION_V019_COMPONENTS,
      },
    ],
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
        components: BINARY_VERSION_V019_COMPONENTS,
      },
    ],
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
        components: ATTESTATION_V019_COMPONENTS,
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
        components: ATTESTATION_V019_COMPONENTS,
      },
    ],
    stateMutability: 'view',
  },
] as const;
