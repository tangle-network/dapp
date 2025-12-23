// Curated ABI for MultiAssetDelegation facet calls (deposit/delegation/views).
// The router ABI from tnt-core omits facet selectors, so we define only
// the functions the dapp calls.
const ABI = [
  {
    type: 'function',
    name: 'depositWithLock',
    inputs: [
      {
        name: 'lockMultiplier',
        type: 'uint8',
        internalType: 'enum Types.LockMultiplier',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'depositERC20WithLock',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'lockMultiplier',
        type: 'uint8',
        internalType: 'enum Types.LockMultiplier',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'delegateWithOptions',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'selectionMode',
        type: 'uint8',
        internalType: 'enum Types.BlueprintSelectionMode',
      },
      {
        name: 'blueprintIds',
        type: 'uint64[]',
        internalType: 'uint64[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'scheduleDelegatorUnstake',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executeDelegatorUnstake',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'scheduleWithdraw',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executeWithdraw',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimDelegatorRewards',
    inputs: [],
    outputs: [
      {
        name: 'totalRewards',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPendingDelegatorRewards',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOperatorRewardPool',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.OperatorRewardPool',
        components: [
          {
            name: 'accRewardPerShare',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'totalShares',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'totalAssets',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'lastUpdateRound',
            type: 'uint64',
            internalType: 'uint64',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPendingUnstakes',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct Types.BondLessRequest[]',
        components: [
          {
            name: 'operator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'asset',
            type: 'tuple',
            internalType: 'struct Types.Asset',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.AssetKind',
              },
              {
                name: 'token',
                type: 'address',
                internalType: 'address',
              },
            ],
          },
          {
            name: 'shares',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'requestedRound',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'selectionMode',
            type: 'uint8',
            internalType: 'enum Types.BlueprintSelectionMode',
          },
          {
            name: 'slashFactorSnapshot',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPendingWithdrawals',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct Types.WithdrawRequest[]',
        components: [
          {
            name: 'asset',
            type: 'tuple',
            internalType: 'struct Types.Asset',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.AssetKind',
              },
              {
                name: 'token',
                type: 'address',
                internalType: 'address',
              },
            ],
          },
          {
            name: 'amount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'requestedRound',
            type: 'uint64',
            internalType: 'uint64',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLocks',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct Types.LockInfo[]',
        components: [
          {
            name: 'amount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'multiplier',
            type: 'uint8',
            internalType: 'enum Types.LockMultiplier',
          },
          {
            name: 'expiryBlock',
            type: 'uint64',
            internalType: 'uint64',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDelegations',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct Types.BondInfoDelegator[]',
        components: [
          {
            name: 'operator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'shares',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'asset',
            type: 'tuple',
            internalType: 'struct Types.Asset',
            components: [
              {
                name: 'kind',
                type: 'uint8',
                internalType: 'enum Types.AssetKind',
              },
              {
                name: 'token',
                type: 'address',
                internalType: 'address',
              },
            ],
          },
          {
            name: 'selectionMode',
            type: 'uint8',
            internalType: 'enum Types.BlueprintSelectionMode',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDeposit',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.Deposit',
        components: [
          {
            name: 'amount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'delegatedAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAssetConfig',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Types.AssetConfig',
        components: [
          {
            name: 'enabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'minOperatorStake',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'minDelegation',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'depositCap',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'currentDeposits',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'rewardMultiplierBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'currentRound',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'roundDuration',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'delegationBondLessDelay',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'leaveDelegatorsDelay',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'leaveOperatorsDelay',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
] as const;

export default ABI;
