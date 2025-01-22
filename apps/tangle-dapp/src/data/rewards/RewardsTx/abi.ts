// The ABI is gotten from the contract
// https://github.com/tangle-network/tangle/blob/48a8d7052750cdfdc79a7aa49d1087057bfa258a/precompiles/rewards/Rewards.sol

import { Abi } from 'viem';

const abi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assetId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
    ],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;

export default abi;
