export const SHIELDED_GATEWAY_ABI = [
  {
    type: 'function',
    name: 'registerPool',
    inputs: [
      { name: 'wrappedToken', type: 'address' },
      { name: 'pool', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPool',
    inputs: [{ name: 'wrappedToken', type: 'address' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'shieldedRequestService',
    inputs: [
      {
        name: 'anchorProof',
        type: 'tuple',
        components: [
          { name: 'proof', type: 'bytes' },
          { name: 'auxPublicInputs', type: 'bytes' },
          { name: 'externalData', type: 'bytes' },
          { name: 'publicInputs', type: 'bytes' },
          { name: 'encryptions', type: 'bytes' },
        ],
      },
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'blueprintId', type: 'uint64' },
          { name: 'operators', type: 'address[]' },
          { name: 'config', type: 'bytes' },
          { name: 'permittedCallers', type: 'address[]' },
          { name: 'ttl', type: 'uint64' },
          { name: 'confidentiality', type: 'uint8' },
        ],
      },
    ],
    outputs: [{ name: 'requestId', type: 'uint64' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'shieldedFundService',
    inputs: [
      {
        name: 'anchorProof',
        type: 'tuple',
        components: [
          { name: 'proof', type: 'bytes' },
          { name: 'auxPublicInputs', type: 'bytes' },
          { name: 'externalData', type: 'bytes' },
          { name: 'publicInputs', type: 'bytes' },
          { name: 'encryptions', type: 'bytes' },
        ],
      },
      { name: 'serviceId', type: 'uint64' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'shieldedFundCredits',
    inputs: [
      {
        name: 'anchorProof',
        type: 'tuple',
        components: [
          { name: 'proof', type: 'bytes' },
          { name: 'auxPublicInputs', type: 'bytes' },
          { name: 'externalData', type: 'bytes' },
          { name: 'publicInputs', type: 'bytes' },
          { name: 'encryptions', type: 'bytes' },
        ],
      },
      { name: 'commitment', type: 'bytes32' },
      { name: 'spendingKey', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'ShieldedServiceRequested',
    inputs: [
      { name: 'requestId', type: 'uint64', indexed: true },
      { name: 'pool', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ShieldedServiceFunded',
    inputs: [
      { name: 'serviceId', type: 'uint64', indexed: true },
      { name: 'pool', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ShieldedCreditsFunded',
    inputs: [
      { name: 'commitment', type: 'bytes32', indexed: true },
      { name: 'pool', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'PoolRegistered',
    inputs: [
      { name: 'token', type: 'address', indexed: true },
      { name: 'pool', type: 'address', indexed: true },
    ],
  },
] as const;
