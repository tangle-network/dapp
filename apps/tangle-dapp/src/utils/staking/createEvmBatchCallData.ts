import { encodeFunctionData } from 'viem';

import {
  AbiFunctionName,
  getPrecompileAbi,
  getPrecompileAddress,
  Precompile,
} from '../../constants/evmPrecompiles';
import { AbiEncodeableValue } from '../../hooks/useEvmPrecompileAbiCall';
import {
  AbiBatchCallArgs,
  AbiBatchCallData,
} from '../../hooks/useEvmPrecompileAbiCall';

function createEvmBatchCallData<PrecompileT extends Precompile>(
  precompile: PrecompileT,
  functionName: AbiFunctionName<PrecompileT>,
  args: AbiEncodeableValue[] | AbiBatchCallArgs,
): AbiBatchCallData {
  const precompileAddress = getPrecompileAddress(precompile);

  // TODO: Add typing for `abi` and `functionNameAsString`
  const abi: unknown[] = getPrecompileAbi(precompile);
  const functionNameAsString: string = functionName;

  return {
    to: precompileAddress,
    value: 0,
    gasLimit: 0,
    callData: encodeFunctionData({
      abi,
      functionName: functionNameAsString,
      args,
    }),
  };
}

export default createEvmBatchCallData;
