type InputType =
  | 'uint256'
  | 'bytes32'
  | 'uint32'
  | 'bool'
  | 'address'
  | 'uint8';

type InputTypeSuper = InputType | `${InputType}[]`;

type InputOutput = {
  internalType: InputTypeSuper;
  name: string;
  type: InputTypeSuper;
};

export enum PrecompileAddress {
  Staking = '0x0000000000000000000000000000000000000800',
  Vesting = '0x0000000000000000000000000000000000000801',
}

export type PrecompileAbiFunction = {
  inputs: InputOutput[];
  name: string;
  outputs: InputOutput[];
  stateMutability: 'nonpayable' | 'view';
  type: 'function';
};

export const STAKING_PRECOMPILE_ABI: PrecompileAbiFunction[] = [
  {
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
    name: 'bond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'maxAdditional',
        type: 'uint256',
      },
    ],
    name: 'bondExtra',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'chill',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentEra',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'eraIndex',
        type: 'uint32',
      },
    ],
    name: 'erasTotalStake',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'stash',
        type: 'address',
      },
    ],
    name: 'isNominator',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'stash',
        type: 'address',
      },
    ],
    name: 'isValidator',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxNominatorCount',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxValidatorCount',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minActiveStake',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minNominatorBond',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minValidatorBond',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'targets',
        type: 'bytes32[]',
      },
    ],
    name: 'nominate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
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
    name: 'payoutStakers',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'rebond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'setController',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'payee',
        type: 'uint8',
      },
    ],
    name: 'setPayee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'unbond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'validatorCount',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'numSlashingSpans',
        type: 'uint32',
      },
    ],
    name: 'withdrawUnbonded',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const VESTING_PRECOMPILE_ABI: PrecompileAbiFunction[] = [
  {
    name: 'vest',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // TODO: Add missing ABI functions. See: https://github.com/webb-tools/tangle/blob/main/precompiles/vesting/src/lib.rs
] as const;
