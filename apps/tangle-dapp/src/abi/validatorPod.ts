export const VALIDATOR_POD_ABI = [
  // Immutables
  {
    inputs: [],
    name: 'podOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'podManager',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'podWithdrawalCredentials',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  // State
  {
    inputs: [],
    name: 'hasRestaked',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'activeValidatorCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalRestakedBalanceGwei',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'beaconChainSlashingFactor',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proofSubmitter',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentCheckpointTimestamp',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastCompletedCheckpointTimestamp',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Checkpoint
  {
    inputs: [],
    name: 'currentCheckpoint',
    outputs: [
      { internalType: 'bytes32', name: 'beaconBlockRoot', type: 'bytes32' },
      { internalType: 'uint24', name: 'proofsRemaining', type: 'uint24' },
      { internalType: 'uint64', name: 'podBalanceGwei', type: 'uint64' },
      { internalType: 'int128', name: 'balanceDeltasGwei', type: 'int128' },
      {
        internalType: 'uint64',
        name: 'priorBeaconBalanceGwei',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'checkpointActive',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Validator Info
  {
    inputs: [{ internalType: 'bytes32', name: 'pubkeyHash', type: 'bytes32' }],
    name: 'validatorInfo',
    outputs: [
      { internalType: 'uint40', name: 'validatorIndex', type: 'uint40' },
      { internalType: 'uint64', name: 'restakedBalanceGwei', type: 'uint64' },
      { internalType: 'uint64', name: 'lastCheckpointedAt', type: 'uint64' },
      { internalType: 'uint8', name: 'status', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'pubkeyHash', type: 'bytes32' }],
    name: 'getValidatorInfo',
    outputs: [
      {
        components: [
          { internalType: 'uint40', name: 'validatorIndex', type: 'uint40' },
          {
            internalType: 'uint64',
            name: 'restakedBalanceGwei',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'lastCheckpointedAt',
            type: 'uint64',
          },
          { internalType: 'uint8', name: 'status', type: 'uint8' },
        ],
        internalType: 'struct ValidatorTypes.ValidatorInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Slashing Factor
  {
    inputs: [],
    name: 'getSlashingFactor',
    outputs: [{ internalType: 'uint64', name: 'factor', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'int256', name: 'shares', type: 'int256' }],
    name: 'applySlashingFactor',
    outputs: [
      { internalType: 'int256', name: 'effectiveShares', type: 'int256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Actions - Withdrawal Credentials
  {
    inputs: [
      { internalType: 'uint64', name: 'beaconTimestamp', type: 'uint64' },
      {
        components: [
          { internalType: 'bytes32', name: 'beaconStateRoot', type: 'bytes32' },
          { internalType: 'bytes', name: 'proof', type: 'bytes' },
        ],
        internalType: 'struct ValidatorTypes.StateRootProof',
        name: 'stateRootProof',
        type: 'tuple',
      },
      { internalType: 'uint40[]', name: 'validatorIndices', type: 'uint40[]' },
      {
        internalType: 'bytes[]',
        name: 'validatorFieldsProofs',
        type: 'bytes[]',
      },
      {
        internalType: 'bytes32[][]',
        name: 'validatorFields',
        type: 'bytes32[][]',
      },
    ],
    name: 'verifyWithdrawalCredentials',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Actions - Checkpoint
  {
    inputs: [{ internalType: 'bool', name: 'revertIfNoBalance', type: 'bool' }],
    name: 'startCheckpoint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'beaconStateRoot', type: 'bytes32' },
          { internalType: 'bytes', name: 'proof', type: 'bytes' },
        ],
        internalType: 'struct ValidatorTypes.StateRootProof',
        name: 'stateRootProof',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'balanceContainerRoot',
            type: 'bytes32',
          },
          { internalType: 'bytes', name: 'proof', type: 'bytes' },
        ],
        internalType: 'struct ValidatorTypes.BalanceContainerProof',
        name: 'balanceContainerProof',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'bytes32', name: 'pubkeyHash', type: 'bytes32' },
          { internalType: 'bytes32', name: 'balanceRoot', type: 'bytes32' },
          { internalType: 'bytes', name: 'proof', type: 'bytes' },
        ],
        internalType: 'struct ValidatorTypes.BalanceProof[]',
        name: 'proofs',
        type: 'tuple[]',
      },
    ],
    name: 'verifyCheckpointProofs',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Actions - Stale Balance
  {
    inputs: [
      { internalType: 'uint64', name: 'beaconTimestamp', type: 'uint64' },
      {
        components: [
          { internalType: 'bytes32', name: 'beaconStateRoot', type: 'bytes32' },
          { internalType: 'bytes', name: 'proof', type: 'bytes' },
        ],
        internalType: 'struct ValidatorTypes.StateRootProof',
        name: 'stateRootProof',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'bytes32[]',
            name: 'validatorFields',
            type: 'bytes32[]',
          },
          { internalType: 'bytes', name: 'proof', type: 'bytes' },
        ],
        internalType: 'struct ValidatorTypes.ValidatorFieldsProof',
        name: 'validatorProof',
        type: 'tuple',
      },
    ],
    name: 'verifyStaleBalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Actions - Withdrawals
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'withdrawNonBeaconChainEth',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'recoverTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Actions - Proof Submitter
  {
    inputs: [
      { internalType: 'address', name: 'newProofSubmitter', type: 'address' },
    ],
    name: 'setProofSubmitter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Constants
  {
    inputs: [],
    name: 'MAX_BEACON_ROOT_AGE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'INITIAL_SLASHING_FACTOR',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'pubkeyHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint40',
        name: 'validatorIndex',
        type: 'uint40',
      },
    ],
    name: 'ValidatorRestaked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'pubkeyHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'amountGwei',
        type: 'uint64',
      },
    ],
    name: 'ValidatorWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'beaconBlockRoot',
        type: 'bytes32',
      },
    ],
    name: 'CheckpointCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'sharesDeltaGwei',
        type: 'int256',
      },
    ],
    name: 'CheckpointFinalized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'NonBeaconChainETHWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'oldFactor',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'newFactor',
        type: 'uint64',
      },
    ],
    name: 'BeaconChainSlashingFactorDecreased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'oldSubmitter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newSubmitter',
        type: 'address',
      },
    ],
    name: 'ProofSubmitterUpdated',
    type: 'event',
  },
] as const;

export default VALIDATOR_POD_ABI;
