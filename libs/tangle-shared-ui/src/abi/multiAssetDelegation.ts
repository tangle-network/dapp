// Auto-generated from tnt-core bindings
// Contract: MULTI_ASSET_DELEGATION

const MULTI_ASSET_DELEGATION_ABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'receive',
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'ADMIN_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ASSET_MANAGER_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'BPS_DENOMINATOR',
    inputs: [],
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
    name: 'DEFAULT_ADMIN_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'LOCK_ONE_MONTH',
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
    name: 'LOCK_SIX_MONTHS',
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
    name: 'LOCK_THREE_MONTHS',
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
    name: 'LOCK_TWO_MONTHS',
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
    name: 'MULTIPLIER_NONE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MULTIPLIER_ONE_MONTH',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MULTIPLIER_SIX_MONTHS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MULTIPLIER_THREE_MONTHS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MULTIPLIER_TWO_MONTHS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'PRECISION',
    inputs: [],
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
    name: 'SLASHER_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'UPGRADE_INTERFACE_VERSION',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'addBlueprint',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addBlueprintToDelegation',
    inputs: [
      {
        name: 'delegationIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addSlasher',
    inputs: [
      {
        name: 'slasher',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'advanceRound',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'blueprintSlashCount',
    inputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'claimOperatorRewards',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimOperatorRewardsTo',
    inputs: [
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address payable',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'completeLeaving',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'delegate',
    inputs: [
      {
        name: 'operator',
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
    name: 'deposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'depositAndDelegate',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'depositAndDelegateWithOptions',
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
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'depositERC20',
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
    name: 'disableAsset',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'enableAsset',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_minOperatorStake',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minDelegation',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_depositCap',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_rewardMultiplierBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'enableAssetWithAdapter',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'adapter',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_minOperatorStake',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minDelegation',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_depositCap',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_rewardMultiplierBps',
        type: 'uint16',
        internalType: 'uint16',
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
    name: 'executeOperatorUnstake',
    inputs: [],
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
    name: 'getAssetAdapter',
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
        type: 'address',
        internalType: 'address',
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
    name: 'getDelegation',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'operator',
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
    name: 'getDelegationBlueprints',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'idx',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint64[]',
        internalType: 'uint64[]',
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
    name: 'getOperatorBlueprints',
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
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOperatorDelegatedStake',
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
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOperatorDelegatorCount',
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
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOperatorDelegators',
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
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOperatorMetadata',
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
        internalType: 'struct Types.OperatorMetadata',
        components: [
          {
            name: 'stake',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'delegationCount',
            type: 'uint32',
            internalType: 'uint32',
          },
          {
            name: 'status',
            type: 'uint8',
            internalType: 'enum Types.OperatorStatus',
          },
          {
            name: 'leavingRound',
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
    name: 'getOperatorSelfStake',
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
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOperatorSlashFactor',
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
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOperatorStake',
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
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
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
    name: 'getPendingOperatorRewards',
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
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'getRoleAdmin',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSlashCount',
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
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSlashCountForBlueprint',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'getSlashCountForService',
    inputs: [
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'getSlashImpact',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'lostAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSlashRecord',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'slashId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct SlashingManager.SlashRecord',
        components: [
          {
            name: 'round',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'serviceId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'blueprintId',
            type: 'uint64',
            internalType: 'uint64',
          },
          {
            name: 'totalSlashed',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exchangeRateBefore',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'exchangeRateAfter',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'evidence',
            type: 'bytes32',
            internalType: 'bytes32',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSnapshot',
    inputs: [
      {
        name: 'round',
        type: 'uint64',
        internalType: 'uint64',
      },
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
        internalType: 'struct Types.OperatorSnapshot',
        components: [
          {
            name: 'stake',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'totalDelegated',
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
    name: 'getTotalDelegation',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'total',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'grantRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'increaseStake',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'nativeMinOperatorStake',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'nativeMinDelegation',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_operatorCommissionBps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isOperator',
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
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isOperatorActive',
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
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isSlasher',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lastRoundAdvance',
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
  {
    type: 'function',
    name: 'meetsStakeRequirement',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'required',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'minOperatorStake',
    inputs: [],
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
    name: 'nativeEnabled',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nextSlashId',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'notifyReward',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
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
    name: 'notifyRewardForBlueprint',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
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
    name: 'operatorAt',
    inputs: [
      {
        name: 'index',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'operatorCommissionBps',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'operatorCount',
    inputs: [],
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
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'proxiableUUID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerAdapter',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'adapter',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerOperator',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'registerOperatorWithAsset',
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
    name: 'removeAdapter',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeBlueprint',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeBlueprintFromDelegation',
    inputs: [
      {
        name: 'delegationIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeSlasher',
    inputs: [
      {
        name: 'slasher',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'callerConfirmation',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requireAdapters',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rescueTokens',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'to',
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
    name: 'revokeRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'rewardsManager',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
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
    name: 'scheduleOperatorUnstake',
    inputs: [
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
    name: 'serviceFeeDistributor',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'serviceSlashCount',
    inputs: [
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'setDelays',
    inputs: [
      {
        name: '_delegationBondLessDelay',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: '_leaveDelegatorsDelay',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: '_leaveOperatorsDelay',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setOperatorCommission',
    inputs: [
      {
        name: 'bps',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setRequireAdapters',
    inputs: [
      {
        name: 'required',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setRewardsManager',
    inputs: [
      {
        name: 'manager',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setServiceFeeDistributor',
    inputs: [
      {
        name: 'distributor',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'slash',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'evidence',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'actualSlashed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'slashForBlueprint',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'evidence',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'actualSlashed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'slashForService',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'commitments',
        type: 'tuple[]',
        internalType: 'struct Types.AssetSecurityCommitment[]',
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
            name: 'exposureBps',
            type: 'uint16',
            internalType: 'uint16',
          },
        ],
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'evidence',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'actualSlashed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'slashHistory',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
    outputs: [
      {
        name: 'round',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'totalSlashed',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'exchangeRateBefore',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'exchangeRateAfter',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'evidence',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'snapshotOperator',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startLeaving',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [
      {
        name: 'interfaceId',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'undelegate',
    inputs: [
      {
        name: 'operator',
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
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'upgradeToAndCall',
    inputs: [
      {
        name: 'newImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'AdapterRegistered',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'adapter',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AdapterRemoved',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AssetDisabled',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AssetEnabled',
    inputs: [
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'minOperatorStake',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'minDelegation',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BlueprintAddedToDelegation',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'delegationIndex',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BlueprintRemovedFromDelegation',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'delegationIndex',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Delegated',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'shares',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'selectionMode',
        type: 'uint8',
        indexed: false,
        internalType: 'enum Types.BlueprintSelectionMode',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DelegatorUnstakeExecuted',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'shares',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DelegatorUnstakeScheduled',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'shares',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'estimatedAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'readyRound',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Deposited',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'lock',
        type: 'uint8',
        indexed: false,
        internalType: 'enum Types.LockMultiplier',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorBlueprintAdded',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorBlueprintRemoved',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorLeavingScheduled',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'readyRound',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorLeft',
    inputs: [
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
    name: 'OperatorRegistered',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'stake',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorSlashed',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'evidence',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorStakeIncreased',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorUnstakeExecuted',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorUnstakeScheduled',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'readyRound',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Paused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RequireAdaptersUpdated',
    inputs: [
      {
        name: 'required',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardClaimed',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardDistributed',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleAdminChanged',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'previousAdminRole',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'newAdminRole',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleGranted',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleRevoked',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoundAdvanced',
    inputs: [
      {
        name: 'round',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SlashRecorded',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'slashId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'totalSlashed',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'exchangeRateBefore',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'exchangeRateAfter',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Slashed',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'operatorSlashed',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'delegatorsSlashed',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newExchangeRate',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SlashedForService',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'serviceId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'blueprintId',
        type: 'uint64',
        indexed: true,
        internalType: 'uint64',
      },
      {
        name: 'totalSlashed',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'commitmentCount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Unpaused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Upgraded',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WithdrawScheduled',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'readyRound',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Withdrawn',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'token',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AccessControlBadConfirmation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AccessControlUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'neededRole',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'AddressEmptyCode',
    inputs: [
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'AllModeDisallowsBlueprints',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AmountLocked',
    inputs: [
      {
        name: 'locked',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'requested',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'AssetNotEnabled',
    inputs: [
      {
        name: 'asset',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'BelowMinimumDeposit',
    inputs: [
      {
        name: 'minimum',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'provided',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'BlueprintAlreadySelected',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'BlueprintNotSelected',
    inputs: [
      {
        name: 'blueprintId',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'CannotRemoveLastBlueprint',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DelegationNotFound',
    inputs: [
      {
        name: 'delegator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'DepositCapExceeded',
    inputs: [
      {
        name: 'cap',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'current',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'adding',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC1967InvalidImplementation',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC1967NonPayable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EnforcedPause',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ExpectedPause',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FailedCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FixedModeRequiresBlueprints',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientAvailableBalance',
    inputs: [
      {
        name: 'available',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'requested',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientDelegation',
    inputs: [
      {
        name: 'available',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'requested',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientDeposit',
    inputs: [
      {
        name: 'available',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'requested',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientStake',
    inputs: [
      {
        name: 'required',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'provided',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidDelegationIndex',
    inputs: [
      {
        name: 'index',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidLockMultiplier',
    inputs: [
      {
        name: 'value',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
  },
  {
    type: 'error',
    name: 'LeavingTooEarly',
    inputs: [
      {
        name: 'currentRound',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'requiredRound',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'LegacySlashRequiresAllMode',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'NoRewardsToClaim',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotFixedMode',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OperatorAlreadyRegistered',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OperatorNotActive',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OperatorNotLeaving',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OperatorNotRegistered',
    inputs: [
      {
        name: 'operator',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RoundAdvanceTooSoon',
    inputs: [
      {
        name: 'nextAllowedTime',
        type: 'uint64',
        internalType: 'uint64',
      },
      {
        name: 'currentTime',
        type: 'uint64',
        internalType: 'uint64',
      },
    ],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'SelectionModeMismatch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TransferFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UUPSUnauthorizedCallContext',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UUPSUnsupportedProxiableUUID',
    inputs: [
      {
        name: 'slot',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroAmount',
    inputs: [],
  },
] as const;

export default MULTI_ASSET_DELEGATION_ABI;
