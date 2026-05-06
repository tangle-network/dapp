import { AbiFunction } from 'viem';

const LST_PRECOMPILE_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
    ],
    name: 'join',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'uint8', name: 'extraType', type: 'uint8' },
      { internalType: 'uint256', name: 'extra', type: 'uint256' },
    ],
    name: 'bondExtra',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'memberAccount', type: 'bytes32' },
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'uint256', name: 'unbondingPoints', type: 'uint256' },
    ],
    name: 'unbond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'uint32', name: 'numSlashingSpans', type: 'uint32' },
    ],
    name: 'poolWithdrawUnbonded',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'memberAccount', type: 'bytes32' },
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'uint32', name: 'numSlashingSpans', type: 'uint32' },
    ],
    name: 'withdrawUnbonded',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes32', name: 'root', type: 'bytes32' },
      { internalType: 'bytes32', name: 'nominator', type: 'bytes32' },
      { internalType: 'bytes32', name: 'bouncer', type: 'bytes32' },
      { internalType: 'uint8[]', name: 'name', type: 'uint8[]' },
      { internalType: 'uint8[]', name: 'icon', type: 'uint8[]' },
    ],
    name: 'create',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'bytes32[]', name: 'validators', type: 'bytes32[]' },
    ],
    name: 'nominate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'uint8', name: 'state', type: 'uint8' },
    ],
    name: 'setState',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'bytes', name: 'metadata', type: 'bytes' },
    ],
    name: 'setMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'minJoinBond', type: 'uint256' },
      { internalType: 'uint256', name: 'minCreateBond', type: 'uint256' },
      { internalType: 'uint32', name: 'maxPools', type: 'uint32' },
      { internalType: 'uint32', name: 'globalMaxCommission', type: 'uint32' },
    ],
    name: 'setConfigs',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'bytes32', name: 'root', type: 'bytes32' },
      { internalType: 'bytes32', name: 'nominator', type: 'bytes32' },
      { internalType: 'bytes32', name: 'bouncer', type: 'bytes32' },
    ],
    name: 'updateRoles',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'poolId', type: 'uint256' }],
    name: 'chill',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'bytes32', name: 'who', type: 'bytes32' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'bondExtraOther',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'uint256', name: 'newCommission', type: 'uint256' },
    ],
    name: 'setCommission',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'uint256', name: 'maxCommission', type: 'uint256' },
    ],
    name: 'setCommissionMax',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'uint256', name: 'maxIncrease', type: 'uint256' },
      { internalType: 'uint256', name: 'minDelay', type: 'uint256' },
    ],
    name: 'setCommissionChangeRate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'poolId', type: 'uint256' }],
    name: 'claimCommission',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'poolId', type: 'uint256' }],
    name: 'adjustPoolDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'poolId', type: 'uint256' },
      { internalType: 'uint8', name: 'permission', type: 'uint8' },
    ],
    name: 'setCommissionClaimPermission',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies AbiFunction[];

export default LST_PRECOMPILE_ABI;
