import { HexString } from '@polkadot/util/types';
import assert from 'assert';
import { useCallback } from 'react';
import {
  Abi as ViemAbi,
  ContractFunctionArgs,
  ContractFunctionName,
} from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { ReadContractReturnType } from 'wagmi/actions';

import { IS_PRODUCTION_ENV } from '../../constants/env';
import ensureError from '../../utils/ensureError';
import useViemPublicClientWithChain from './useViemPublicClientWithChain';

export type ContractReadOptions<
  Abi extends ViemAbi,
  FunctionName extends ContractFunctionName<Abi, 'pure' | 'view'>,
> = {
  address: HexString;
  functionName: FunctionName;
  args: ContractFunctionArgs<Abi, 'pure' | 'view', FunctionName>;
};

const useContractReadOnce = <Abi extends ViemAbi>(abi: Abi) => {
  // Use Sepolia testnet for development, and mainnet for production.
  // Some dummy contracts were deployed on Sepolia for testing purposes.
  const chain = IS_PRODUCTION_ENV ? mainnet : sepolia;

  const publicClient = useViemPublicClientWithChain(chain);

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
      assert(
        publicClient !== null,
        "Should not be able to call this function if the client isn't ready yet",
      );

      try {
        return await publicClient.readContract({
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
    [abi, publicClient],
  );

  // Only provide the read functions once the public client is ready.
  return publicClient === null ? null : read;
};

export default useContractReadOnce;
