export const VANCHOR_ABI = [
  {
    type: 'function',
    name: 'transact',
    inputs: [
      { name: '_proof', type: 'bytes' },
      { name: '_auxPublicInputs', type: 'bytes' },
      {
        name: '_externalData',
        type: 'tuple',
        components: [
          { name: 'recipient', type: 'address' },
          { name: 'extAmount', type: 'int256' },
          { name: 'relayer', type: 'address' },
          { name: 'fee', type: 'uint256' },
          { name: 'refund', type: 'uint256' },
          { name: 'token', type: 'address' },
        ],
      },
      {
        name: '_publicInputs',
        type: 'tuple',
        components: [
          { name: 'roots', type: 'bytes' },
          { name: 'extensionRoots', type: 'bytes' },
          { name: 'inputNullifiers', type: 'uint256[]' },
          { name: 'outputCommitments', type: 'uint256[2]' },
          { name: 'publicAmount', type: 'uint256' },
          { name: 'extDataHash', type: 'uint256' },
        ],
      },
      {
        name: '_encryptions',
        type: 'tuple',
        components: [
          { name: 'encryptedOutput1', type: 'bytes' },
          { name: 'encryptedOutput2', type: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getLastRoot',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLatestNeighborEdges',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'chainID', type: 'uint256' },
          { name: 'root', type: 'uint256' },
          { name: 'latestLeafIndex', type: 'uint256' },
          { name: 'srcResourceID', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getNextIndex',
    inputs: [],
    outputs: [{ name: '', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'NewCommitment',
    inputs: [
      { name: 'commitment', type: 'uint256', indexed: false },
      { name: 'subTreeIndex', type: 'uint256', indexed: false },
      { name: 'leafIndex', type: 'uint256', indexed: false },
      { name: 'encryptedOutput', type: 'bytes', indexed: false },
    ],
  },
] as const;
