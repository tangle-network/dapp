import { AbiFunction, encodeFunctionData } from 'viem';

import {
  ExtractAbiFunctionNames,
  FindAbiArgsOf,
  PrecompileAddress,
} from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import { AbiBatchCall } from '../../hooks/useEvmPrecompileCall';
import { assertEvmAddress } from '@tangle-network/ui-components';

const createEvmBatchCall = <
  Abi extends AbiFunction[],
  FunctionName extends ExtractAbiFunctionNames<Abi>,
>(
  abi: Abi,
  precompileAddress: PrecompileAddress,
  functionName: FunctionName,
  args: FindAbiArgsOf<Abi, FunctionName>,
): AbiBatchCall => {
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

export default createEvmBatchCall;
