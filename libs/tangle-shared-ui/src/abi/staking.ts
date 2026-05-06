import { AbiFunction } from 'viem';

const STAKING_PRECOMPILE_ABI = [
  {
    name: 'bond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'payee',
        type: 'bytes32',
      },
    ],
  },
  {
    name: 'bondExtra',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint256',
        name: 'maxAdditional',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    name: 'chill',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    outputs: [],
  },
  {
    name: 'currentEra',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
  },
  {
    name: 'erasTotalStake',
    stateMutability: 'view',
    type: 'function',
    inputs: [
      {
        internalType: 'uint32',
        name: 'eraIndex',
        type: 'uint32',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    name: 'isNominator',
    stateMutability: 'view',
    type: 'function',
    inputs: [
      {
        internalType: 'address',
        name: 'stash',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
  },
  {
    name: 'isValidator',
    stateMutability: 'view',
    type: 'function',
    inputs: [
      {
        internalType: 'address',
        name: 'stash',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
  },
  {
    name: 'maxNominatorCount',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
  },
  {
    name: 'maxValidatorCount',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
  },
  {
    name: 'minActiveStake',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    name: 'minNominatorBond',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    name: 'minValidatorBond',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    name: 'nominate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'targets',
        type: 'bytes32[]',
      },
    ],
    outputs: [],
  },
  {
    name: 'payoutStakers',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'bytes32',
        name: 'validatorStash',
        type: 'bytes32',
      },
      {
        internalType: 'uint32',
        name: 'era',
        type: 'uint32',
      },
    ],
    outputs: [],
  },
  {
    name: 'rebond',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    name: 'setController',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    outputs: [],
  },
  {
    name: 'setPayee',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint8',
        name: 'payee',
        type: 'uint8',
      },
    ],
    outputs: [],
  },
  {
    name: 'unbond',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    name: 'validatorCount',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
  },
  {
    name: 'withdrawUnbonded',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint32',
        name: 'numSlashingSpans',
        type: 'uint32',
      },
    ],
    outputs: [],
  },
] as const satisfies AbiFunction[];

export default STAKING_PRECOMPILE_ABI;
