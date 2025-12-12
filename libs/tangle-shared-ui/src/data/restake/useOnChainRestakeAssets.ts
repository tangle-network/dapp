/**
 * On-chain fallback for discovering restakable assets when GraphQL indexer is unavailable.
 * NOTE: This is a minimal fallback - only supports native ETH when indexer is down.
 * For full asset support, the GraphQL indexer must be running.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useAccount, useBalance, useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { CACHE_CONFIG } from '../../constants/cacheConfig';
import type { RestakeAsset } from './types';

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
 * Minimal on-chain fallback hook when indexer is unavailable.
 * Only supports native ETH - ERC20 tokens require the GraphQL indexer.
 */
export const useOnChainRestakeAssets = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options ?? {};
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { address: userAddress } = useAccount();

  const contracts = chainId ? getContractsByChainId(chainId) : null;

  // Query native ETH config
  const {
    data: nativeConfig,
    isLoading: isLoadingConfig,
    refetch: refetchConfig,
  } = useQuery({
    queryKey: ['onChainNativeAssetConfig', chainId],
    queryFn: async () => {
      if (!publicClient || !contracts) {
        return null;
      }

      try {
        const config = (await publicClient.readContract({
          address: contracts.multiAssetDelegation,
          abi: MULTI_ASSET_DELEGATION_ABI,
          functionName: 'getAssetConfig',
          args: [NATIVE_TOKEN_ADDRESS],
        })) as AssetConfig;

        return config.enabled ? config : null;
      } catch {
        // Contract may not support native token config - this is expected on some networks
        // Native ETH will still be available with default config values
        return null;
      }
    },
    enabled: enabled && !!publicClient && !!contracts,
    ...CACHE_CONFIG.ASSETS,
  });

  // Fetch native balance
  const {
    data: nativeBalanceData,
    isLoading: isLoadingBalances,
    refetch: refetchBalances,
  } = useBalance({
    address: userAddress,
    enabled: Boolean(userAddress),
    watch: Boolean(userAddress),
  });
  const nativeBalance = nativeBalanceData?.value ?? BigInt(0);

  // Build assets map - always include native ETH even if contract query fails
  // This ensures users can see/transfer their native balance in fallback mode
  const assets = (() => {
    const assetMap = new Map<Address, RestakeAsset>();

    // Always include native ETH with either contract config or sensible defaults
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
        enabled: nativeConfig?.enabled ?? true,
        minOperatorStake: nativeConfig?.minOperatorStake ?? BigInt(0),
        minDelegation: nativeConfig?.minDelegation ?? BigInt(0),
        depositCap: nativeConfig?.depositCap ?? BigInt(0),
        currentDeposits: nativeConfig?.currentDeposits ?? BigInt(0),
        rewardMultiplierBps: nativeConfig?.rewardMultiplierBps ?? 0,
        createdAt: BigInt(0),
        updatedAt: BigInt(0),
      },
    });

    return assetMap;
  })();

  const refetch = async () => {
    await Promise.all([refetchConfig(), refetchBalances()]);
  };

  return {
    assets,
    assetList: assets ? Array.from(assets.values()) : [],
    isLoading: isLoadingConfig,
    isLoadingBalances,
    refetch,
    refetchBalances,
    source: 'onchain' as const,
  };
};

export default useOnChainRestakeAssets;
