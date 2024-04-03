export enum Precompile {
  STAKING,
  VESTING,
  BATCH,
  BALANCES_ERC20,
}

type StakingAbiFunctionName =
  | 'bond'
  | 'bondExtra'
  | 'chill'
  | 'currentEra'
  | 'erasTotalStake'
  | 'isNominator'
  | 'isValidator'
  | 'maxNominatorCount'
  | 'maxValidatorCount'
  | 'minActiveStake'
  | 'minNominatorBond'
  | 'minValidatorBond'
  | 'nominate'
  | 'payoutStakers'
  | 'rebond'
  | 'setController'
  | 'setPayee'
  | 'unbond'
  | 'validatorCount'
  | 'withdrawUnbonded';

export type AbiFunctionName<T extends Precompile> = T extends Precompile.STAKING
  ? StakingAbiFunctionName
  : T extends Precompile.VESTING
  ? 'vest' | 'vestOther' | 'vestedTransfer'
  : T extends Precompile.BATCH
  ? 'batchAll' | 'batchSome' | 'batchSomeUntilFailure'
  : T extends Precompile.BALANCES_ERC20
  ? 'allowance' | 'transfer' | 'approve' | 'transferFrom' | 'balanceOf'
  : never;

type InputType =
  | 'uint256'
  | 'bytes32'
  | 'uint32'
  | 'bool'
  | 'address'
  | 'uint8'
  | 'bytes'
  | 'uint64';

type InputTypeSuper = InputType | `${InputType}[]`;

type InputOutput = {
  internalType: InputTypeSuper;
  name: string;
  type: InputTypeSuper;
};

// See https://github.com/webb-tools/tangle/tree/main/precompiles for more details.
export enum PrecompileAddress {
  STAKING = '0x0000000000000000000000000000000000000800',
  VESTING = '0x0000000000000000000000000000000000000801',
  BATCH = '0x0000000000000000000000000000000000000808',
  BALANCES_ERC20 = '0x0000000000000000000000000000000000000802',
}

export type PrecompileAbiFunction<T extends Precompile> = {
  inputs: InputOutput[];
  name: AbiFunctionName<T>;
  outputs: InputOutput[];
  stateMutability: 'nonpayable' | 'view';
  type: 'function';
};

export const STAKING_PRECOMPILE_ABI: PrecompileAbiFunction<Precompile.STAKING>[] =
  [
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

// See: https://github.com/webb-tools/tangle/blob/main/precompiles/vesting/src/lib.rs
// Be careful with the input/outputs, as they can lead to a lot of trouble
// if not properly specified.
export const VESTING_PRECOMPILE_ABI: PrecompileAbiFunction<Precompile.VESTING>[] =
  [
    {
      inputs: [],
      name: 'vest',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'target',
          type: 'bytes32',
        },
        {
          internalType: 'uint8',
          name: 'index',
          type: 'uint8',
        },
      ],
      name: 'vestedTransfer',
      outputs: [
        {
          internalType: 'uint8',
          name: '',
          type: 'uint8',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'target',
          type: 'bytes32',
        },
      ],
      name: 'vestOther',
      outputs: [
        {
          internalType: 'uint8',
          name: '',
          type: 'uint8',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const;

export const BATCH_PRECOMPILE_ABI: PrecompileAbiFunction<Precompile.BATCH>[] = [
  {
    name: 'batchAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'address[]',
        name: 'to',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'value',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: 'callData',
        type: 'bytes[]',
      },
      {
        internalType: 'uint64[]',
        name: 'gasLimit',
        type: 'uint64[]',
      },
    ],
  },
  {
    name: 'batchSome',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'address[]',
        name: 'to',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'value',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: 'callData',
        type: 'bytes[]',
      },
      {
        internalType: 'uint64[]',
        name: 'gasLimit',
        type: 'uint64[]',
      },
    ],
  },
  {
    name: 'batchSomeUntilFailure',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'address[]',
        name: 'to',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'value',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: 'callData',
        type: 'bytes[]',
      },
      {
        internalType: 'uint64[]',
        name: 'gasLimit',
        type: 'uint64[]',
      },
    ],
  },
] as const;

export const BALANCES_ERC20_PRECOMPILE_ABI: PrecompileAbiFunction<Precompile.BALANCES_ERC20>[] =
  [
    {
      name: 'allowance',
      stateMutability: 'view',
      type: 'function',
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
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
      name: 'approve',
      stateMutability: 'nonpayable',
      type: 'function',
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
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
      name: 'balanceOf',
      stateMutability: 'view',
      type: 'function',
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
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
      name: 'transfer',
      stateMutability: 'nonpayable',
      type: 'function',
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
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
      name: 'transferFrom',
      stateMutability: 'nonpayable',
      type: 'function',
      inputs: [
        {
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
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
  ];

export function getAddressOfPrecompile(
  precompile: Precompile
): PrecompileAddress {
  switch (precompile) {
    case Precompile.STAKING:
      return PrecompileAddress.STAKING;
    case Precompile.VESTING:
      return PrecompileAddress.VESTING;
    case Precompile.BATCH:
      return PrecompileAddress.BATCH;
    case Precompile.BALANCES_ERC20:
      return PrecompileAddress.BALANCES_ERC20;
  }
}

export function getAbiForPrecompile(
  precompile: Precompile
): PrecompileAbiFunction<Precompile>[] {
  switch (precompile) {
    case Precompile.STAKING:
      return STAKING_PRECOMPILE_ABI;
    case Precompile.VESTING:
      return VESTING_PRECOMPILE_ABI;
    case Precompile.BATCH:
      return BATCH_PRECOMPILE_ABI;
    case Precompile.BALANCES_ERC20:
      return BALANCES_ERC20_PRECOMPILE_ABI;
  }
}
