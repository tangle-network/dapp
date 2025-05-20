import { AbiFunction } from 'viem';

const CREDITS_PRECOMPILE_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount_to_claim',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'offchain_account_id',
        type: 'bytes',
      },
    ],
    name: 'claim_credits',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies AbiFunction[];

export default CREDITS_PRECOMPILE_ABI;
