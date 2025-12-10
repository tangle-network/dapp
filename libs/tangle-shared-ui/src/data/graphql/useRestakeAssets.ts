/**
 * Hook for fetching restaking assets with metadata and balances.
 * Combines GraphQL restaking asset data with ERC20 token metadata and user balances.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, erc20Abi } from 'viem';
import { useAccount, useBalance, usePublicClient } from 'wagmi';
import { useRestakingAssets, type RestakingAsset } from './useRestakingAssets';
import { EnvioNetwork } from '../../utils/executeEnvioGraphQL';
import fetchErc20TokenMetadata from '../../utils/fetchErc20TokenMetadata';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';

// Token metadata from ERC20
export interface TokenMetadata {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
}

// Combined restake asset with metadata and balance
export interface RestakeAsset {
  id: Address; // Token address (EVM format)
  metadata: TokenMetadata;
  balance: bigint; // User's wallet balance
  restakingInfo: RestakingAsset; // On-chain restaking config from indexer
}

// Map of assets keyed by token address
export type RestakeAssetMap = Map<Address, RestakeAsset>;

/**
 * Hook to fetch restaking assets with full metadata and balances.
 *
 * @example
 * ```tsx
 * const { assets, isLoading, refetch } = useRestakeAssets();
 *
 * // Access asset data
 * const usdcAsset = assets.get('0xa0b86991...');
 * console.log(usdcAsset?.balance); // User's USDC balance
 * console.log(usdcAsset?.metadata.symbol); // 'USDC'
 * console.log(usdcAsset?.restakingInfo.minDelegation); // Min delegation from indexer
 * ```
 */
export const useRestakeAssets = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();

  // 1. Fetch restaking assets from GraphQL indexer
  const {
    data: restakingAssets,
    isLoading: isLoadingAssets,
    refetch: refetchAssets,
  } = useRestakingAssets({
    network,
    enabledOnly: true,
    enabled,
  });

  // Get token addresses from restaking assets
  const tokenAddresses = restakingAssets?.map((a) => a.token) ?? [];

  // 2. Fetch ERC20 metadata for all tokens
  const { data: tokenMetadatas, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['erc20Metadata', tokenAddresses, publicClient?.chain?.id],
    queryFn: async () => {
      if (!publicClient || tokenAddresses.length === 0) {
        return [];
      }
      // Cast publicClient to any to avoid type incompatibility between wagmi and viem versions
      return fetchErc20TokenMetadata(
        publicClient as any,
        tokenAddresses as EvmAddress[],
      );
    },
    enabled: enabled && !!publicClient && tokenAddresses.length > 0,
    staleTime: Infinity, // Token metadata doesn't change
  });

  // 3. Fetch user balances for all tokens using multicall
  const {
    data: balances,
    isLoading: isLoadingBalances,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: [
      'erc20Balances',
      userAddress,
      tokenAddresses,
      publicClient?.chain?.id,
    ],
    queryFn: async () => {
      if (!publicClient || !userAddress || tokenAddresses.length === 0) {
        return new Map<Address, bigint>();
      }

      try {
        // Use multicall to fetch all balances at once
        const calls = tokenAddresses.map((token) => ({
          address: token,
          abi: erc20Abi,
          functionName: 'balanceOf' as const,
          args: [userAddress] as const,
        }));

        const results = await publicClient.multicall({ contracts: calls });
        const balanceMap = new Map<Address, bigint>();

        results.forEach((result, index) => {
          const token = tokenAddresses[index];
          if (result.status === 'success') {
            balanceMap.set(token, result.result as bigint);
          } else {
            balanceMap.set(token, BigInt(0));
          }
        });

        return balanceMap;
      } catch (error) {
        console.error('Failed to fetch token balances:', error);
        return new Map<Address, bigint>();
      }
    },
    enabled:
      enabled && !!publicClient && !!userAddress && tokenAddresses.length > 0,
    staleTime: 15_000, // 15 seconds - balances can change frequently
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
  });

  // 4. Combine all data into RestakeAsset map
  const { data: assets } = useQuery({
    queryKey: ['restakeAssets', restakingAssets, tokenMetadatas, balances],
    queryFn: () => {
      if (!restakingAssets || !tokenMetadatas) {
        return null;
      }

      const assetMap = new Map<Address, RestakeAsset>();

      for (const restakingAsset of restakingAssets) {
        const metadata = tokenMetadatas.find(
          (m) => m.id.toLowerCase() === restakingAsset.token.toLowerCase(),
        );

        // Skip if we couldn't fetch metadata
        if (!metadata) {
          console.warn(`Missing metadata for token ${restakingAsset.token}`);
          continue;
        }

        const balance = balances?.get(restakingAsset.token) ?? BigInt(0);

        assetMap.set(restakingAsset.token, {
          id: restakingAsset.token,
          metadata: {
            address: restakingAsset.token,
            name: metadata.name,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
          },
          balance,
          restakingInfo: restakingAsset,
        });
      }

      return assetMap;
    },
    enabled: !!restakingAssets && !!tokenMetadatas,
    staleTime: 15_000,
  });

  // Refetch function that refreshes all data
  const refetch = async () => {
    await Promise.all([refetchAssets(), refetchBalances()]);
  };

  return {
    assets: assets ?? null,
    assetList: assets ? Array.from(assets.values()) : [],
    isLoading: isLoadingAssets || isLoadingMetadata,
    isLoadingBalances,
    refetch,
    refetchBalances,
  };
};

/**
 * Hook to get a single restaking asset by token address.
 */
export const useRestakeAsset = (
  tokenAddress: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { assets, isLoading, isLoadingBalances, refetch } =
    useRestakeAssets(options);

  return {
    asset: tokenAddress ? (assets?.get(tokenAddress) ?? null) : null,
    isLoading,
    isLoadingBalances,
    refetch,
  };
};

/**
 * Hook to get native currency balance (ETH/Base ETH/Arbitrum ETH).
 * For native token restaking.
 */
export const useNativeBalance = () => {
  const { address } = useAccount();
  const { data, isLoading, refetch } = useBalance({
    address,
  });

  return {
    balance: data?.value ?? BigInt(0),
    decimals: data?.decimals ?? 18,
    symbol: data?.symbol ?? 'ETH',
    isLoading,
    refetch,
  };
};

export default useRestakeAssets;
