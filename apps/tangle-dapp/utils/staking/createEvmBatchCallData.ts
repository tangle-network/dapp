import { encodeFunctionData } from 'viem';

import {
  AbiFunctionName,
  getPrecompileAbi,
  getPrecompileAddress,
  Precompile,
} from '../../constants/evmPrecompiles';
import { EvmBatchCallData } from '../../hooks/useEvmPrecompileAbiCall';

function createEvmBatchCallData<PrecompileT extends Precompile>(
  precompile: PrecompileT,
  functionName: AbiFunctionName<PrecompileT>,
  // TODO: Make use of `AbiFunctionArgs`.
  args: unknown[]
): EvmBatchCallData {
  const precompileAddress = getPrecompileAddress(precompile);

  return {
    to: precompileAddress,
    value: 0,
    gasLimit: 0,
    callData: encodeFunctionData({
      abi: getPrecompileAbi(precompile),
      functionName,
      args,
    }),
  };
}

export default createEvmBatchCallData;
