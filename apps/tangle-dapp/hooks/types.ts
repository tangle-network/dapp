import type { MaybePromise } from 'viem/_types/types/utils';

import type { AbiFunctionName, Precompile } from '../constants/evmPrecompiles';

export type EvmAbiCallData<PrecompileT extends Precompile> = {
  functionName: AbiFunctionName<PrecompileT>;
  // TODO: Use argument types from the ABI.
  arguments: unknown[];
};

export type EvmTxFactory<PrecompileT extends Precompile, Context> = (
  context: Context
) => MaybePromise<EvmAbiCallData<PrecompileT>> | null;
