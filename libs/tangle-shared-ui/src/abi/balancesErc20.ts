import { AbiFunction } from 'viem';

const BALANCES_ERC20_PRECOMPILE_ABI = [
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
] as const satisfies AbiFunction[];

export default BALANCES_ERC20_PRECOMPILE_ABI;
