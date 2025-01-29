import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import assert from 'assert';
import { useCallback } from 'react';
import {
  Abi as ViemAbi,
  ContractFunctionArgs,
  ContractFunctionName,
} from 'viem';
import { ReadContractReturnType } from 'wagmi/actions';

import useDebugMetricsStore from '../../context/useDebugMetricsStore';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import useViemPublicClient from '@webb-tools/tangle-shared-ui/hooks/useViemPublicClient';

export type ContractReadOptions<
  Abi extends ViemAbi,
  FunctionName extends ContractFunctionName<Abi, 'pure' | 'view'>,
> = {
  address: EvmAddress;
  functionName: FunctionName;
  args: ContractFunctionArgs<Abi, 'pure' | 'view', FunctionName>;
};

const useContractReadOnce = <Abi extends ViemAbi>(abi: Abi) => {
  const { incrementRequestCount } = useDebugMetricsStore();
  const viemPublicClient = useViemPublicClient();

  const isReady = viemPublicClient !== null;

  const read = useCallback(
    async <FunctionName extends ContractFunctionName<Abi, 'pure' | 'view'>>({
      address,
      functionName,
      args,
    }: ContractReadOptions<Abi, FunctionName>): Promise<
      | ReadContractReturnType<
          Abi,
          FunctionName,
          ContractFunctionArgs<Abi, 'pure' | 'view', FunctionName>
        >
      | Error
    > => {
      assert(isReady);
      incrementRequestCount();

      try {
        return await viemPublicClient.readContract({
          address,
          abi,
          functionName,
          args,
        });
      } catch (possibleError) {
        const error = ensureError(possibleError);

        console.error(
          `Error reading contract ${address} function ${functionName}:`,
          error,
        );

        return error;
      }
    },
    [abi, incrementRequestCount, isReady, viemPublicClient],
  );

  // Only provide the read functions once the public client is ready.
  return isReady ? read : null;
};

export default useContractReadOnce;
