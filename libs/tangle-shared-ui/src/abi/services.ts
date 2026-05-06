import { AbiFunction } from 'viem';

const SERVICES_PRECOMPILE_ABI = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'blueprint_data',
        type: 'bytes',
      },
    ],
    name: 'createBlueprint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'blueprint_id',
        type: 'uint256',
      },
      {
        internalType: 'bytes[]',
        name: 'security_requirements',
        type: 'bytes[]',
      },
      {
        internalType: 'bytes',
        name: 'permitted_callers_data',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'service_providers_data',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'request_args_data',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'ttl',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'payment_asset_id',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'payment_token_address',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'payment_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: 'min_operators',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'max_operators',
        type: 'uint32',
      },
    ],
    name: 'requestService',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'service_id',
        type: 'uint256',
      },
    ],
    name: 'terminateService',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'service_id',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'job',
        type: 'uint8',
      },
      {
        internalType: 'bytes',
        name: 'args_data',
        type: 'bytes',
      },
    ],
    name: 'callJob',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'offender',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'service_id',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'percent',
        type: 'uint8',
      },
    ],
    name: 'slash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'era',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'index',
        type: 'uint32',
      },
    ],
    name: 'dispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies AbiFunction[];

export default SERVICES_PRECOMPILE_ABI;
