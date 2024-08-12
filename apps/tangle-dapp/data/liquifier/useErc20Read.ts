import assert from 'assert';
import { useCallback, useEffect, useState } from 'react';
import {
  ContractFunctionArgs,
  ContractFunctionName,
  createPublicClient,
  erc20Abi,
  http,
  PublicClient,
} from 'viem';
import { mainnet } from 'viem/chains';

import { ERC20_TOKEN_MAP, Erc20TokenId } from './erc20';

export type Erc20ReadOptions<
  T extends ContractFunctionName<typeof erc20Abi, 'pure' | 'view'>,
> = {
  tokenId: Erc20TokenId;
  functionName: T;
  args: ContractFunctionArgs<typeof erc20Abi, 'pure' | 'view', T>;
};

const useErc20Read = () => {
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);

  useEffect(() => {
    const newPublicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    setPublicClient(newPublicClient);
  }, []);

  const read = useCallback(
    <T extends ContractFunctionName<typeof erc20Abi, 'pure' | 'view'>>(
      options: Erc20ReadOptions<T>,
    ) => {
      assert(
        publicClient !== null,
        "Should not be able to call this function if the client isn't ready yet",
      );

      const tokenDef = ERC20_TOKEN_MAP[options.tokenId];

      return publicClient.readContract({
        address: tokenDef.address,
        abi: erc20Abi,
        functionName: options.functionName,
        args: options.args,
      });
    },
    [publicClient],
  );

  // Only provide the read function once the client is ready.
  return publicClient === null ? null : read;
};

export default useErc20Read;
