import { AbiFunction } from 'viem';

const CREDITS_PRECOMPILE_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountToClaim',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'offchainAccountId',
        type: 'string',
      },
    ],
    name: 'claimCredits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies AbiFunction[];

export default CREDITS_PRECOMPILE_ABI;