const liquifierChainlinkAdapterAbi = [
  {
    constant: false,
    inputs: [
      {
        name: '_operator',
        type: 'address',
      },
    ],
    name: 'addVault',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'currentTime',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getMaxDeposits',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getMinDeposits',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getVaultDepositLimits',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_token',
        type: 'address',
      },
      {
        name: '_stakingPool',
        type: 'address',
      },
      {
        name: '_stakeController',
        type: 'address',
      },
      {
        name: '_vaultImplementation',
        type: 'address',
      },
      {
        name: '_minDepositThreshold',
        type: 'uint256',
      },
      {
        name: '_fees',
        type: 'tuple[]',
      },
      {
        name: '_initialVaults',
        type: 'address[]',
      },
    ],
    name: 'initialize',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_index',
        type: 'uint256',
      },
      {
        name: '_operator',
        type: 'address',
      },
    ],
    name: 'setOperator',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'validator',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'stake',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'validator',
        type: 'address',
      },
      {
        name: 'currentStake',
        type: 'uint256',
      },
    ],
    name: 'rebase',
    outputs: [
      {
        name: 'newStake',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'validator',
        type: 'address',
      },
    ],
    name: 'isValidator',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'validator',
        type: 'address',
      },
      {
        name: 'assets',
        type: 'uint256',
      },
    ],
    name: 'previewDeposit',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'pure',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'validator',
        type: 'uint256',
      },
    ],
    name: 'previewWithdraw',
    outputs: [
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'unlockTime',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'validator',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'unstake',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'validator',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'VaultAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'depositedAmount',
        type: 'uint256',
      },
    ],
    name: 'DepositBufferedTokens',
    type: 'event',
  },
] as const;

export default liquifierChainlinkAdapterAbi;
