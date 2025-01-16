import { AbiFunction, encodeFunctionData } from 'viem';

import {
  ExtractAbiFunctionNames,
  FindAbiArgsOf,
  PrecompileAddress,
} from '../../constants/evmPrecompiles';
import { AbiBatchCallData } from '../../hooks/useEvmPrecompileAbiCall';
import { assertEvmAddress } from '@webb-tools/webb-ui-components';

const createEvmBatchCallData = <
  Abi extends AbiFunction[],
  FunctionName extends ExtractAbiFunctionNames<Abi>,
>(
  abi: Abi,
  precompileAddress: PrecompileAddress,
  functionName: FunctionName,
  args: FindAbiArgsOf<Abi, FunctionName>,
): AbiBatchCallData => {
  const functionNameAsString: string = functionName;

  return {
    to: assertEvmAddress(precompileAddress),
    value: 0,
    gasLimit: 0,
    callData: encodeFunctionData({
      abi: abi satisfies AbiFunction[] as AbiFunction[],
      functionName: functionNameAsString,
      args,
    }),
  };
};

export default createEvmBatchCallData;
