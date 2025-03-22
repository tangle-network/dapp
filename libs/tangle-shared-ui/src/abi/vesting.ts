import { AbiFunction } from 'viem';

// See: https://github.com/tangle-network/tangle/blob/main/precompiles/vesting/src/lib.rs
// Be careful with the input/outputs, as they can lead to a lot of trouble
// if not properly specified.
const VESTING_PRECOMPILE_ABI = [
  {
    name: 'vest',
    type: 'function',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const satisfies AbiFunction[];

export default VESTING_PRECOMPILE_ABI;
