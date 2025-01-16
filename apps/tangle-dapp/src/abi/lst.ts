import { AbiFunction } from 'viem';

const LST_PRECOMPILE_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
    ],
    name: 'join',
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
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'extraType',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'extra',
        type: 'uint256',
      },
    ],
    name: 'bondExtra',
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
        name: 'memberAccount',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'unbondingPoints',
        type: 'uint256',
      },
    ],
    name: 'unbond',
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
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: 'numSlashingSpans',
        type: 'uint32',
      },
    ],
    name: 'poolWithdrawUnbonded',
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
        name: 'memberAccount',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: 'numSlashingSpans',
        type: 'uint32',
      },
    ],
    name: 'withdrawUnbonded',
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
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'nominator',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'bouncer',
        type: 'bytes32',
      },
      {
        internalType: 'uint8[]',
        name: 'name',
        type: 'uint8[]',
      },
      {
        internalType: 'uint8[]',
        name: 'icon',
        type: 'uint8[]',
      },
    ],
    name: 'create',
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
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: 'validators',
        type: 'bytes32[]',
      },
    ],
    name: 'nominate',
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
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'state',
        type: 'uint8',
      },
    ],
    name: 'setState',
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
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'metadata',
        type: 'bytes',
      },
    ],
    name: 'setMetadata',
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
        internalType: 'uint256',
        name: 'minJoinBond',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'minCreateBond',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: 'maxPools',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'globalMaxCommission',
        type: 'uint32',
      },
    ],
    name: 'setConfigs',
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
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'nominator',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'bouncer',
        type: 'bytes32',
      },
    ],
    name: 'updateRoles',
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
] as const satisfies AbiFunction[];

export default LST_PRECOMPILE_ABI;
