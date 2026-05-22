// Hand-written ABI for the BlueprintAuditors governance registry.
//
// Mirrors the read surface used by the dapp:
//   - getAuditor(address)         -> Auditor
//   - isActiveAuditor(address)    -> bool
//   - auditorWeight(address)      -> uint16
//   - auditorCount()              -> uint256
//   - auditorAt(uint256)          -> address
//
// Writes (admit / remove / setActive / setWeight / metadata) intentionally
// omitted — those are governance-only and not surfaced through the dapp UI.
//
// Once tnt-core ships a stable bindings export for the auditor registry,
// this file can be regenerated from there. Until then it tracks the
// source-of-truth shape in src/governance/BlueprintAuditors.sol.

const ABI = [
  {
    type: 'function',
    name: 'getAuditor',
    inputs: [
      { name: 'auditor', type: 'address', internalType: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct BlueprintAuditors.Auditor',
        components: [
          { name: 'name', type: 'string', internalType: 'string' },
          { name: 'metadataUri', type: 'string', internalType: 'string' },
          { name: 'weight', type: 'uint16', internalType: 'uint16' },
          {
            name: 'tier',
            type: 'uint8',
            internalType: 'enum BlueprintAuditors.AuditorTier',
          },
          { name: 'active', type: 'bool', internalType: 'bool' },
          { name: 'admittedAt', type: 'uint64', internalType: 'uint64' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isActiveAuditor',
    inputs: [
      { name: 'auditor', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'auditorWeight',
    inputs: [
      { name: 'auditor', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: '', type: 'uint16', internalType: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'auditorCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'auditorAt',
    inputs: [{ name: 'index', type: 'uint256', internalType: 'uint256' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
] as const;

export default ABI;
