import { Abi } from 'viem';

const LIQUID_DELEGATION_FACTORY_ABI = [
  // View functions
  {
    inputs: [],
    name: 'staking',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'vaults',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint64[]', name: 'blueprintIds', type: 'uint64[]' },
    ],
    name: 'computeVaultKey',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint64[]', name: 'blueprintIds', type: 'uint64[]' },
    ],
    name: 'getVault',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'operator', type: 'address' }],
    name: 'getOperatorVaults',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'asset', type: 'address' }],
    name: 'getAssetVaults',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllVaults',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vaultCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint64[]', name: 'blueprintIds', type: 'uint64[]' },
    ],
    name: 'createVault',
    outputs: [{ internalType: 'address', name: 'vault', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'operator', type: 'address' },
      { internalType: 'address', name: 'asset', type: 'address' },
    ],
    name: 'createAllBlueprintsVault',
    outputs: [{ internalType: 'address', name: 'vault', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint64[]',
        name: 'blueprintIds',
        type: 'uint64[]',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
    ],
    name: 'VaultCreated',
    type: 'event',
  },
  // Errors
  {
    inputs: [],
    name: 'VaultAlreadyExists',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OperatorNotActive',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AssetNotEnabled',
    type: 'error',
  },
] as const satisfies Abi;

export default LIQUID_DELEGATION_FACTORY_ABI;
