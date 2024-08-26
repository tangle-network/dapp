import { Abi, erc721Abi } from 'viem';

const LIQUIFIER_UNLOCKS_ABI = [
  ...erc721Abi,
  {
    inputs: [
      {
        internalType: 'address',
        name: '_registry',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_renderer',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'unlockId',
        type: 'uint256',
      },
    ],
    name: 'createUnlock',
    outputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'unlockId',
        type: 'uint256',
      },
    ],
    name: 'useUnlock',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'getMetadata',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maturity',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'progress',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'unlockId',
            type: 'uint256',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'validator',
            type: 'address',
          },
        ],
        internalType: 'struct Metadata',
        name: 'metadata',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: '_isValidLiquifier',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'liquifier',
        type: 'address',
      },
      {
        internalType: 'uint96',
        name: 'unlockId',
        type: 'uint96',
      },
    ],
    name: '_encodeTokenId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: '_decodeTokenId',
    outputs: [
      {
        internalType: 'address payable',
        name: 'liquifier',
        type: 'address',
      },
      {
        internalType: 'uint96',
        name: 'unlockId',
        type: 'uint96',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'NotOwnerOf',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'NotLiquifier',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidID',
    type: 'error',
  },
] as const satisfies Abi;

export default LIQUIFIER_UNLOCKS_ABI;
