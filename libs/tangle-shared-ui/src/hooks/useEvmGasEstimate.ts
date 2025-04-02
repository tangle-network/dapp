import { useCallback } from 'react';
import { AbiFunction } from 'viem';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import useViemPublicClient from './useViemPublicClient';
import {
  ExtractAbiFunctionNames,
  PrecompileAddress,
} from '../constants/evmPrecompiles';
import { PrecompileCall } from './useEvmPrecompileCall';

/**
 * Add a buffer to the gas estimate to ensure the
 * transaction is successful.
 */
const BUFFER = BigInt(15); // +50% (1.5)

const useEvmGasEstimate = () => {
  const { evmAddress } = useAgnosticAccountInfo();
  const viemPublicClient = useViemPublicClient();

  const estimateGas = useCallback(
    async <
      Abi extends AbiFunction[],
      FunctionName extends ExtractAbiFunctionNames<Abi>,
    >(
      abi: Abi,
      precompileAddress: PrecompileAddress,
      call: PrecompileCall<Abi, FunctionName>,
    ) => {
      if (viemPublicClient === null || evmAddress === null) {
        return null;
      }

      const gasEstimate = await viemPublicClient.estimateContractGas({
        abi: abi satisfies AbiFunction[] as AbiFunction[],
        account: evmAddress,
        address: precompileAddress,
        functionName: call.functionName,
        args: call.arguments,
      });

      return (gasEstimate * BUFFER) / BigInt(10);
    },
    [evmAddress, viemPublicClient],
  );

  return estimateGas;
};

export default useEvmGasEstimate;
