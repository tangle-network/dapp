/**
 * Hook for fetching ERC20 token metadata (symbol and decimals).
 */

import { useQuery } from '@tanstack/react-query';
import { Address, erc20Abi, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';

export interface TokenMetadataResult {
  symbol: string;
  decimals: number;
  isNative: boolean;
}

export interface UseTokenMetadataOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch token metadata (symbol, decimals) for a given token address.
 * Returns native token metadata (ETH) for address(0).
 *
 * @param tokenAddress - The token address to fetch metadata for
 * @param options - Configuration options
 */
export const useTokenMetadata = (
  tokenAddress: Address | undefined,
  options?: UseTokenMetadataOptions,
) => {
  const { enabled = true } = options ?? {};
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  return useQuery({
    queryKey: ['tokenMetadata', chainId, tokenAddress],
    queryFn: async (): Promise<TokenMetadataResult> => {
      // Native token (address(0) or undefined)
      if (!tokenAddress || tokenAddress === zeroAddress) {
        return {
          symbol: 'ETH',
          decimals: 18,
          isNative: true,
        };
      }

      if (!publicClient) {
        return {
          symbol: 'TOKEN',
          decimals: 18,
          isNative: false,
        };
      }

      try {
        // Fetch symbol and decimals in parallel
        const [symbol, decimals] = await Promise.all([
          publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'symbol',
          }),
          publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'decimals',
          }),
        ]);

        return {
          symbol: symbol as string,
          decimals: decimals as number,
          isNative: false,
        };
      } catch {
        // Fallback for non-standard tokens
        return {
          symbol: 'TOKEN',
          decimals: 18,
          isNative: false,
        };
      }
    },
    enabled: enabled && (tokenAddress === undefined || !!publicClient),
    staleTime: 60_000 * 60, // Token metadata rarely changes, cache for 1 hour
    retry: 2,
  });
};

export default useTokenMetadata;
