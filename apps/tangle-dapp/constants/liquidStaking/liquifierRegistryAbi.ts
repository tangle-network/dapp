import { Abi } from 'viem';

const LIQUIFIER_REGISTRY_ABI = [
  // Constructor
  {
    type: 'constructor',
    stateMutability: 'nonpayable',
    inputs: [],
  },

  // Initialize function
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      { internalType: 'address', name: '_liquifier', type: 'address' },
      { internalType: 'address', name: '_unlocks', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // Getters
  {
    type: 'function',
    name: 'adapter',
    inputs: [{ internalType: 'address', name: 'asset', type: 'address' }],
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'liquifier',
    inputs: [],
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'treasury',
    inputs: [],
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'unlocks',
    inputs: [],
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'fee',
    inputs: [{ internalType: 'address', name: 'asset', type: 'address' }],
    outputs: [{ internalType: 'uint96', name: '', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isLiquifier',
    inputs: [{ internalType: 'address', name: 'liquifier', type: 'address' }],
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLiquifier',
    inputs: [
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'address', name: 'validator', type: 'address' },
    ],
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
  },

  // Setters
  {
    type: 'function',
    name: 'registerAdapter',
    inputs: [
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'address', name: 'adapter', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerLiquifier',
    inputs: [
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'address', name: 'validator', type: 'address' },
      { internalType: 'address', name: 'liquifier', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setFee',
    inputs: [
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint96', name: 'fee', type: 'uint96' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTreasury',
    inputs: [{ internalType: 'address', name: 'treasury', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // Required by UUPSUpgradeable
  {
    type: 'function',
    name: '_authorizeUpgrade',
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // Events
  {
    type: 'event',
    name: 'AdapterRegistered',
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'adapter',
        type: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewLiquifier',
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'validator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'liquifier',
        type: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FeeAdjusted',
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldFee',
        type: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TreasurySet',
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'treasury',
        type: 'address',
      },
    ],
    anonymous: false,
  },
] as const satisfies Abi;

export default LIQUIFIER_REGISTRY_ABI;
