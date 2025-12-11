/**
 * On-chain fallback for discovering restakable assets when GraphQL indexer is unavailable.
 * Uses LOCAL_MOCK_TOKENS config and queries MultiAssetDelegation contract directly.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, erc20Abi } from 'viem';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { LOCAL_MOCK_TOKENS } from '@tangle-network/dapp-config/localTokens';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import fetchErc20TokenMetadata from '../../utils/fetchErc20TokenMetadata';
import { CACHE_CONFIG } from '../../constants/cacheConfig';
import type { RestakeAsset } from '../graphql/useRestakeAssets';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';

// AssetConfig from MultiAssetDelegation contract
interface AssetConfig {
  enabled: boolean;
  minOperatorStake: bigint;
  minDelegation: bigint;
  depositCap: bigint;
  currentDeposits: bigint;
  rewardMultiplierBps: number;
}

/**
 * Hook to discover and fetch restaking assets directly from on-chain contracts.
 * This is used as a fallback when the GraphQL indexer is unavailable.
 *
 * For local development (chain ID 84532), uses LOCAL_MOCK_TOKENS as the token list
 * and verifies each is enabled via MultiAssetDelegation.getAssetConfig.
 */
export const useOnChainRestakeAssets = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options ?? {};
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { address: userAddress } = useAccount();

  const contracts = chainId ? getContractsByChainId(chainId) : null;
  const isLocalDev = chainId === 84532 || chainId === 31337;

  // 1. Get potential token addresses (from config for local dev)
  const potentialTokens = isLocalDev
    ? LOCAL_MOCK_TOKENS.map((t) => t.address)
    : [];

  // 2. Query which tokens are enabled
  const {
    data: enabledTokens,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useQuery({
    queryKey: ['onChainAssetConfigs', chainId, potentialTokens],
    queryFn: async () => {
      if (!publicClient || !contracts || potentialTokens.length === 0) {
        return [];
      }

      // Batch query asset configs
      const calls = potentialTokens.map((token) => ({
        address: contracts.multiAssetDelegation,
        abi: MULTI_ASSET_DELEGATION_ABI,
        functionName: 'getAssetConfig' as const,
        args: [token] as const,
      }));

      const results = await publicClient.multicall({ contracts: calls });

      const enabled: Array<{
        token: Address;
        config: AssetConfig;
      }> = [];

      results.forEach((result, index) => {
        if (result.status === 'success') {
          const config = result.result as AssetConfig;
          if (config.enabled) {
            enabled.push({
              token: potentialTokens[index],
              config,
            });
          }
        }
      });

      return enabled;
    },
    enabled: enabled && !!publicClient && potentialTokens.length > 0,
    ...CACHE_CONFIG.ASSETS,
  });

  // Get token addresses from enabled configs
  const tokenAddresses = enabledTokens?.map((e) => e.token) ?? [];

  // 3. Fetch ERC20 metadata
  const { data: tokenMetadatas, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['onChainErc20Metadata', tokenAddresses, chainId],
    queryFn: async () => {
      if (!publicClient || tokenAddresses.length === 0) {
        return [];
      }
      return fetchErc20TokenMetadata(
        publicClient as any,
        tokenAddresses as EvmAddress[],
      );
    },
    enabled: enabled && !!publicClient && tokenAddresses.length > 0,
    staleTime: Infinity, // Token metadata doesn't change
  });

  // 4. Fetch user balances
  const {
    data: balances,
    isLoading: isLoadingBalances,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: ['onChainErc20Balances', userAddress, tokenAddresses, chainId],
    queryFn: async () => {
      if (!publicClient || !userAddress || tokenAddresses.length === 0) {
        return new Map<Address, bigint>();
      }

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
        balanceMap.set(
          token,
          result.status === 'success' ? (result.result as bigint) : BigInt(0),
        );
      });

      return balanceMap;
    },
    enabled:
      enabled && !!publicClient && !!userAddress && tokenAddresses.length > 0,
    ...CACHE_CONFIG.BALANCES,
  });

  // 5. Combine into RestakeAsset map
  // Note: We use tokenAddresses and userAddress as keys instead of full objects
  // because React Query can't serialize BigInt values in enabledTokens/balances
  const { data: assets } = useQuery({
    queryKey: [
      'onChainRestakeAssets',
      tokenAddresses,
      tokenMetadatas?.length ?? 0,
      userAddress,
      chainId,
    ],
    queryFn: () => {
      if (!enabledTokens || !tokenMetadatas) {
        return null;
      }

      const assetMap = new Map<Address, RestakeAsset>();

      for (const { token, config } of enabledTokens) {
        const metadata = tokenMetadatas.find(
          (m) => m.id.toLowerCase() === token.toLowerCase(),
        );

        if (!metadata) {
          // Use fallback from LOCAL_MOCK_TOKENS if metadata fetch failed
          const fallback = LOCAL_MOCK_TOKENS.find(
            (t) => t.address.toLowerCase() === token.toLowerCase(),
          );
          if (!fallback) continue;

          assetMap.set(token, {
            id: token,
            metadata: {
              address: token,
              name: fallback.name,
              symbol: fallback.symbol,
              decimals: fallback.decimals,
            },
            balance: balances?.get(token) ?? BigInt(0),
            restakingInfo: {
              id: token,
              token,
              enabled: true,
              minOperatorStake: config.minOperatorStake,
              minDelegation: config.minDelegation,
              depositCap: config.depositCap,
              currentDeposits: config.currentDeposits,
              rewardMultiplierBps: config.rewardMultiplierBps,
              createdAt: BigInt(0),
              updatedAt: BigInt(0),
            },
          });
          continue;
        }

        assetMap.set(token, {
          id: token,
          metadata: {
            address: token,
            name: metadata.name,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
          },
          balance: balances?.get(token) ?? BigInt(0),
          restakingInfo: {
            id: token,
            token,
            enabled: true,
            minOperatorStake: config.minOperatorStake,
            minDelegation: config.minDelegation,
            depositCap: config.depositCap,
            currentDeposits: config.currentDeposits,
            rewardMultiplierBps: config.rewardMultiplierBps,
            createdAt: BigInt(0),
            updatedAt: BigInt(0),
          },
        });
      }

      return assetMap;
    },
    enabled: !!enabledTokens && !!tokenMetadatas,
    staleTime: CACHE_CONFIG.ASSETS.staleTime,
  });

  const refetch = async () => {
    await Promise.all([refetchConfigs(), refetchBalances()]);
  };

  return {
    assets: assets ?? null,
    assetList: assets ? Array.from(assets.values()) : [],
    isLoading: isLoadingConfigs || isLoadingMetadata,
    isLoadingBalances,
    refetch,
    refetchBalances,
    source: 'onchain' as const,
  };
};

export default useOnChainRestakeAssets;
