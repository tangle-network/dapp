/**
 * Hook for fetching restaking assets with metadata and balances.
 * Combines GraphQL restaking asset data with ERC20 token metadata and user balances.
 * Automatically falls back to on-chain queries when the indexer is unavailable.
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Address, erc20Abi, zeroAddress } from 'viem';
import { useAccount, useBalance, useChainId, usePublicClient } from 'wagmi';
import { useRestakingAssets } from './useRestakingAssets';
import type { RestakeAsset } from '../restake/types';
import { EnvioNetwork } from '../../utils/executeEnvioGraphQL';
import { useEnvioHealthCheckByChainId } from '../../utils/checkEnvioHealth';
import fetchErc20TokenMetadata from '../../utils/fetchErc20TokenMetadata';
import useOnChainRestakeAssets from '../restake/useOnChainRestakeAssets';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';

// Native token (ETH) uses zero address - needs special handling
const NATIVE_TOKEN_ADDRESS = zeroAddress as Address;

// Re-export types from shared types file
export type {
  RestakingAsset,
  TokenMetadata,
  RestakeAsset,
  RestakeAssetMap,
} from '../restake/types';

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

  // Determine data source:
  // - While checking health: wait (neither source enabled)
  // - Indexer healthy: use GraphQL
  // - Indexer unhealthy: use on-chain fallback
  const healthCheckComplete = !isCheckingHealth;
  const useGraphQL = healthCheckComplete && isIndexerHealthy === true;
  const useOnChainFallback = healthCheckComplete && !isIndexerHealthy;

  // Debug for local testnet
  useEffect(() => {
    console.log('[useRestakeAssets] Data source:', {
      chainId,
      isCheckingHealth,
      isIndexerHealthy,
      useGraphQL,
      useOnChainFallback,
      publicClientAvailable: !!publicClient,
    });
  }, [
    chainId,
    isCheckingHealth,
    isIndexerHealthy,
    useGraphQL,
    useOnChainFallback,
    publicClient,
  ]);

  // On-chain fallback hook (for when indexer is unavailable)
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
    enabled: enabled && useGraphQL,
  });

  // Get token addresses from restaking assets, filtering out native token (zero address)
  // Native token doesn't have ERC20 metadata and must be handled separately
  const allTokenAddresses = restakingAssets?.map((a) => a.token) ?? [];
  const erc20TokenAddresses = allTokenAddresses.filter(
    (addr) => addr.toLowerCase() !== NATIVE_TOKEN_ADDRESS.toLowerCase(),
  );
  const hasNativeToken = allTokenAddresses.some(
    (addr) => addr.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase(),
  );

  // 2. Fetch ERC20 metadata for ERC20 tokens only (not native token)
  const { data: tokenMetadatas, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['erc20Metadata', erc20TokenAddresses, publicClient?.chain?.id],
    queryFn: async () => {
      if (!publicClient || erc20TokenAddresses.length === 0) {
        return [];
      }
      // Cast publicClient to any to avoid type incompatibility between wagmi and viem versions
      return fetchErc20TokenMetadata(
        publicClient as any,
        erc20TokenAddresses as EvmAddress[],
      );
    },
    enabled:
      enabled &&
      !useOnChainFallback &&
      !!publicClient &&
      erc20TokenAddresses.length > 0,
    staleTime: Infinity, // Token metadata doesn't change
  });

  // 3. Fetch user balances for ERC20 tokens using multicall
  const {
    data: balances,
    isLoading: isLoadingBalances,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: [
      'erc20Balances',
      userAddress,
      erc20TokenAddresses,
      publicClient?.chain?.id,
    ],
    queryFn: async () => {
      if (!publicClient || !userAddress || erc20TokenAddresses.length === 0) {
        return new Map<Address, bigint>();
      }

      try {
        // Use multicall to fetch all ERC20 balances at once
        const calls = erc20TokenAddresses.map((token) => ({
          address: token,
          abi: erc20Abi,
          functionName: 'balanceOf' as const,
          args: [userAddress] as const,
        }));

        const results = await publicClient.multicall({ contracts: calls });
        const balanceMap = new Map<Address, bigint>();

        results.forEach((result, index) => {
          const token = erc20TokenAddresses[index];
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
      erc20TokenAddresses.length > 0,
    staleTime: 15_000, // 15 seconds - balances can change frequently
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
  });

  // 4. Combine all data into RestakeAsset map (only when using indexer)
  // Note: We use tokenAddresses and counts as keys instead of full objects
  // because React Query can't serialize BigInt values
  const { data: graphqlAssets } = useQuery({
    queryKey: [
      'restakeAssets',
      erc20TokenAddresses,
      tokenMetadatas?.length ?? 0,
      hasNativeToken,
      userAddress,
      chainId,
    ],
    queryFn: () => {
      if (!restakingAssets) {
        return null;
      }

      // Need tokenMetadatas if there are ERC20 tokens
      if (erc20TokenAddresses.length > 0 && !tokenMetadatas) {
        return null;
      }

      const assetMap = new Map<Address, RestakeAsset>();

      for (const restakingAsset of restakingAssets) {
        const isNativeToken =
          restakingAsset.token.toLowerCase() ===
          NATIVE_TOKEN_ADDRESS.toLowerCase();

        if (isNativeToken) {
          // Native token (ETH) has hardcoded metadata
          assetMap.set(NATIVE_TOKEN_ADDRESS, {
            id: NATIVE_TOKEN_ADDRESS,
            metadata: {
              address: NATIVE_TOKEN_ADDRESS,
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            balance: BigInt(0), // Native balance is fetched separately via useNativeBalance
            restakingInfo: restakingAsset,
          });
          continue;
        }

        const metadata = tokenMetadatas?.find(
          (m) => m.id.toLowerCase() === restakingAsset.token.toLowerCase(),
        );

        // Try fallback metadata if on-chain fetch failed
        const fallbackMetadata = getCachedTokenMetadata(restakingAsset.token);

        // Use fetched metadata, cached fallback, or create placeholder from address
        const balance = balances?.get(restakingAsset.token) ?? BigInt(0);
        const tokenMetadata = metadata ??
          fallbackMetadata ?? {
            // Placeholder when metadata unavailable - use truncated address
            name: `Token ${restakingAsset.token.slice(0, 8)}...`,
            symbol: `${restakingAsset.token.slice(0, 6)}...${restakingAsset.token.slice(-4)}`,
            decimals: 18, // Default to 18 decimals
          };

        assetMap.set(restakingAsset.token, {
          id: restakingAsset.token,
          metadata: {
            address: restakingAsset.token,
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            decimals: tokenMetadata.decimals,
          },
          balance,
          restakingInfo: restakingAsset,
        });
      }

      return assetMap;
    },
    // Enable when we have restaking assets - metadata is optional (will use placeholders)
    enabled: !useOnChainFallback && !!restakingAssets,
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

  // Still checking health - return loading state
  if (isCheckingHealth) {
    return {
      assets: null,
      assetList: [],
      isLoading: true,
      isLoadingBalances: false,
      refetch,
      refetchBalances,
      source: 'loading' as const,
    };
  }

  // Use on-chain data if fallback is active
  if (useOnChainFallback) {
    return {
      assets: onChainResult.assets,
      assetList: onChainResult.assetList,
      isLoading: onChainResult.isLoading,
      isLoadingBalances: onChainResult.isLoadingBalances,
      refetch,
      refetchBalances: onChainResult.refetchBalances,
      source: 'onchain' as const,
    };
  }

  // Use GraphQL data (indexer is healthy)
  return {
    assets: graphqlAssets ?? null,
    assetList: graphqlAssets ? Array.from(graphqlAssets.values()) : [],
    isLoading: isLoadingAssets || isLoadingMetadata,
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
