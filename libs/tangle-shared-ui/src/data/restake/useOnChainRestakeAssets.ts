/**
 * On-chain fallback for discovering restakable assets when GraphQL indexer is unavailable.
 * Uses LOCAL_MOCK_TOKENS config and queries MultiAssetDelegation contract directly.
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Address, erc20Abi, zeroAddress } from 'viem';
import { useAccount, useBalance, useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { LOCAL_MOCK_TOKENS } from '@tangle-network/dapp-config/localTokens';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import fetchErc20TokenMetadata from '../../utils/fetchErc20TokenMetadata';
import { CACHE_CONFIG } from '../../constants/cacheConfig';
import type { RestakeAsset } from '../graphql/useRestakeAssets';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';

// Native token uses zero address
const NATIVE_TOKEN_ADDRESS = zeroAddress as Address;

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
  // Always include native token (ETH) as a potential restaking asset
  const erc20Tokens = isLocalDev ? LOCAL_MOCK_TOKENS.map((t) => t.address) : [];
  const potentialTokens = [NATIVE_TOKEN_ADDRESS, ...erc20Tokens];

  // Debug: Log the state
  useEffect(() => {
    console.log('[useOnChainRestakeAssets]', {
      enabled,
      chainId,
      isLocalDev,
      potentialTokensCount: potentialTokens.length,
      hasContracts: !!contracts,
      multiAssetDelegation: contracts?.multiAssetDelegation,
      hasPublicClient: !!publicClient,
    });
  }, [
    enabled,
    chainId,
    isLocalDev,
    potentialTokens.length,
    contracts,
    publicClient,
  ]);

  // 2. Query which tokens are enabled
  const {
    data: enabledTokens,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useQuery({
    queryKey: ['onChainAssetConfigs', chainId, potentialTokens],
    queryFn: async () => {
      console.log('[useOnChainRestakeAssets] queryFn called:', {
        potentialTokensCount: potentialTokens.length,
        potentialTokens,
        multiAssetDelegation: contracts?.multiAssetDelegation,
      });

      if (!publicClient || !contracts || potentialTokens.length === 0) {
        console.log('[useOnChainRestakeAssets] Early return - missing deps');
        return [];
      }

      // Batch query asset configs
      const calls = potentialTokens.map((token) => ({
        address: contracts.multiAssetDelegation,
        abi: MULTI_ASSET_DELEGATION_ABI,
        functionName: 'getAssetConfig' as const,
        args: [token] as const,
      }));

      console.log('[useOnChainRestakeAssets] Calling multicall...');
      const results = await publicClient.multicall({ contracts: calls });
      console.log('[useOnChainRestakeAssets] Multicall results:', results);

      const enabled: Array<{
        token: Address;
        config: AssetConfig;
      }> = [];

      results.forEach((result, index) => {
        if (result.status === 'success') {
          const config = result.result as AssetConfig;
          console.log(
            `[useOnChainRestakeAssets] Token ${potentialTokens[index]}:`,
            {
              enabled: config.enabled,
              config,
            },
          );
          if (config.enabled) {
            enabled.push({
              token: potentialTokens[index],
              config,
            });
          }
        } else {
          console.log(
            `[useOnChainRestakeAssets] Token ${potentialTokens[index]} failed:`,
            result,
          );
        }
      });

      console.log(
        '[useOnChainRestakeAssets] Found enabled tokens:',
        enabled.length,
      );
      return enabled;
    },
    enabled: enabled && !!publicClient && potentialTokens.length > 0,
    ...CACHE_CONFIG.ASSETS,
  });

  // Get token addresses from enabled configs, separating native ETH from ERC20
  const allTokenAddresses = enabledTokens?.map((e) => e.token) ?? [];
  const erc20TokenAddresses = allTokenAddresses.filter(
    (addr) => addr.toLowerCase() !== NATIVE_TOKEN_ADDRESS.toLowerCase(),
  );
  const hasNativeToken = allTokenAddresses.some(
    (addr) => addr.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase(),
  );
  const nativeTokenConfig = enabledTokens?.find(
    (e) => e.token.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase(),
  )?.config;

  // Fetch native balance using wagmi hook
  const { data: nativeBalanceData } = useBalance({
    address: userAddress,
  });
  const nativeBalance = nativeBalanceData?.value ?? BigInt(0);

  // 3. Fetch ERC20 metadata (only for ERC20 tokens, not native)
  const { data: tokenMetadatas, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['onChainErc20Metadata', erc20TokenAddresses, chainId],
    queryFn: async () => {
      if (!publicClient || erc20TokenAddresses.length === 0) {
        return [];
      }
      return fetchErc20TokenMetadata(
        publicClient as any,
        erc20TokenAddresses as EvmAddress[],
      );
    },
    enabled: enabled && !!publicClient && erc20TokenAddresses.length > 0,
    staleTime: Infinity, // Token metadata doesn't change
  });

  // 4. Fetch user ERC20 balances
  const {
    data: balances,
    isLoading: isLoadingBalances,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: [
      'onChainErc20Balances',
      userAddress,
      erc20TokenAddresses,
      chainId,
    ],
    queryFn: async () => {
      if (!publicClient || !userAddress || erc20TokenAddresses.length === 0) {
        return new Map<Address, bigint>();
      }

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
        balanceMap.set(
          token,
          result.status === 'success' ? (result.result as bigint) : BigInt(0),
        );
      });

      return balanceMap;
    },
    enabled:
      enabled &&
      !!publicClient &&
      !!userAddress &&
      erc20TokenAddresses.length > 0,
    ...CACHE_CONFIG.BALANCES,
  });

  // 5. Combine into RestakeAsset map
  // Note: We use tokenAddresses and userAddress as keys instead of full objects
  // because React Query can't serialize BigInt values in enabledTokens/balances
  const { data: assets } = useQuery({
    queryKey: [
      'onChainRestakeAssets',
      erc20TokenAddresses,
      tokenMetadatas?.length ?? 0,
      hasNativeToken,
      userAddress,
      chainId,
    ],
    queryFn: () => {
      if (!enabledTokens) {
        return null;
      }

      // Need tokenMetadatas if there are ERC20 tokens
      if (erc20TokenAddresses.length > 0 && !tokenMetadatas) {
        return null;
      }

      const assetMap = new Map<Address, RestakeAsset>();

      // Add native ETH if enabled
      if (hasNativeToken && nativeTokenConfig) {
        assetMap.set(NATIVE_TOKEN_ADDRESS, {
          id: NATIVE_TOKEN_ADDRESS,
          metadata: {
            address: NATIVE_TOKEN_ADDRESS,
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
          },
          balance: nativeBalance,
          restakingInfo: {
            id: NATIVE_TOKEN_ADDRESS,
            token: NATIVE_TOKEN_ADDRESS,
            enabled: true,
            minOperatorStake: nativeTokenConfig.minOperatorStake,
            minDelegation: nativeTokenConfig.minDelegation,
            depositCap: nativeTokenConfig.depositCap,
            currentDeposits: nativeTokenConfig.currentDeposits,
            rewardMultiplierBps: nativeTokenConfig.rewardMultiplierBps,
            createdAt: BigInt(0),
            updatedAt: BigInt(0),
          },
        });
      }

      // Add ERC20 tokens
      for (const { token, config } of enabledTokens) {
        // Skip native token (already handled above)
        if (token.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
          continue;
        }

        const metadata = tokenMetadatas?.find(
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
    // Enable when we have enabled tokens and either:
    // 1. No ERC20 tokens (only native), or
    // 2. Token metadata is loaded for ERC20 tokens
    enabled:
      !!enabledTokens && (erc20TokenAddresses.length === 0 || !!tokenMetadatas),
    staleTime: CACHE_CONFIG.ASSETS.staleTime,
  });

  const refetch = async () => {
    await Promise.all([refetchConfigs(), refetchBalances()]);
  };

  // Debug: Log results
  useEffect(() => {
    console.log('[useOnChainRestakeAssets] Results:', {
      enabledTokensCount: enabledTokens?.length ?? 0,
      tokenMetadatasCount: tokenMetadatas?.length ?? 0,
      assetsCount: assets?.size ?? 0,
      isLoadingConfigs,
      isLoadingMetadata,
    });
  }, [
    enabledTokens,
    tokenMetadatas,
    assets,
    isLoadingConfigs,
    isLoadingMetadata,
  ]);

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
