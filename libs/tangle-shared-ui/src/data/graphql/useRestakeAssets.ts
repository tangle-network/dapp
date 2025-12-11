/**
 * Hook for fetching restaking assets with metadata and balances.
 * Combines GraphQL restaking asset data with ERC20 token metadata and user balances.
 * Automatically falls back to on-chain queries when the indexer is unavailable.
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Address, erc20Abi } from 'viem';
import { useAccount, useBalance, useChainId, usePublicClient } from 'wagmi';
import { useRestakingAssets, type RestakingAsset } from './useRestakingAssets';
import { EnvioNetwork } from '../../utils/executeEnvioGraphQL';
import { useEnvioHealthCheckByChainId } from '../../utils/checkEnvioHealth';
import fetchErc20TokenMetadata from '../../utils/fetchErc20TokenMetadata';
import useOnChainRestakeAssets from '../restake/useOnChainRestakeAssets';
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
 * Automatically falls back to on-chain queries when the indexer is unavailable.
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
  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();

  // Check if indexer is healthy
  const { data: isIndexerHealthy, isLoading: isCheckingHealth } =
    useEnvioHealthCheckByChainId(chainId);

  // Determine if we should use on-chain fallback
  const useOnChainFallback = !isCheckingHealth && !isIndexerHealthy;

  // Debug: Log the state
  useEffect(() => {
    console.log('[useRestakeAssets]', {
      chainId,
      isCheckingHealth,
      isIndexerHealthy,
      useOnChainFallback,
      enabled,
    });
  }, [
    chainId,
    isCheckingHealth,
    isIndexerHealthy,
    useOnChainFallback,
    enabled,
  ]);

  // On-chain fallback hook (always called but may be disabled)
  const onChainResult = useOnChainRestakeAssets({
    enabled: enabled && useOnChainFallback,
  });

  // 1. Fetch restaking assets from GraphQL indexer (only if healthy)
  const {
    data: restakingAssets,
    isLoading: isLoadingAssets,
    refetch: refetchAssets,
  } = useRestakingAssets({
    network,
    enabledOnly: true,
    enabled: enabled && !useOnChainFallback,
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
    enabled:
      enabled &&
      !useOnChainFallback &&
      !!publicClient &&
      tokenAddresses.length > 0,
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
      enabled &&
      !useOnChainFallback &&
      !!publicClient &&
      !!userAddress &&
      tokenAddresses.length > 0,
    staleTime: 15_000, // 15 seconds - balances can change frequently
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
  });

  // 4. Combine all data into RestakeAsset map (only when using indexer)
  // Note: We use tokenAddresses and counts as keys instead of full objects
  // because React Query can't serialize BigInt values
  const { data: graphqlAssets } = useQuery({
    queryKey: [
      'restakeAssets',
      tokenAddresses,
      tokenMetadatas?.length ?? 0,
      userAddress,
      chainId,
    ],
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
    enabled: !useOnChainFallback && !!restakingAssets && !!tokenMetadatas,
    staleTime: 15_000,
  });

  // Refetch function that refreshes all data
  const refetch = async () => {
    if (useOnChainFallback) {
      await onChainResult.refetch();
    } else {
      await Promise.all([refetchAssets(), refetchBalances()]);
    }
  };

  // Use on-chain data if fallback is active, otherwise use GraphQL data
  if (useOnChainFallback) {
    return {
      assets: onChainResult.assets,
      assetList: onChainResult.assetList,
      isLoading: isCheckingHealth || onChainResult.isLoading,
      isLoadingBalances: onChainResult.isLoadingBalances,
      refetch,
      refetchBalances: onChainResult.refetchBalances,
      source: 'onchain' as const,
    };
  }

  return {
    assets: graphqlAssets ?? null,
    assetList: graphqlAssets ? Array.from(graphqlAssets.values()) : [],
    isLoading: isCheckingHealth || isLoadingAssets || isLoadingMetadata,
    isLoadingBalances,
    refetch,
    refetchBalances,
    source: 'graphql' as const,
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
