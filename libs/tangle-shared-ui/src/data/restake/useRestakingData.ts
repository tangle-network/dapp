/**
 * Composite hook for fetching all restaking data.
 * Combines assets, delegator info, and provides unified loading/error states.
 * Handles indexer unavailability gracefully.
 */

import { useMemo } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import {
  useRestakeAssets,
  type RestakeAssetMap,
} from '../graphql/useRestakeAssets';
import { useDelegator, type Delegator } from '../graphql/useDelegator';
import {
  useRestakingAssets,
  type RestakingAsset,
} from '../graphql/useRestakingAssets';
import {
  useIndexerStatusStandalone,
  type DataSource,
} from '../../context/IndexerStatusContext';
import { useOnChainDelegator } from './useOnChainDelegator';

export interface RestakingDataState {
  // Assets
  assets: RestakeAssetMap | null;
  assetList: import('../graphql/useRestakeAssets').RestakeAsset[];
  restakingAssets: RestakingAsset[] | null;

  // Delegator
  delegator: Delegator | null;

  // Loading states
  isLoading: boolean;
  isLoadingAssets: boolean;
  isLoadingDelegator: boolean;

  // Error states
  hasError: boolean;
  error: Error | null;

  // Data source info
  dataSource: DataSource;
  isIndexerHealthy: boolean;

  // Refresh functions
  refetchAssets: () => Promise<void>;
  refetchDelegator: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

export interface UseRestakingDataOptions {
  /** Whether to enable the hook. Defaults to true. */
  enabled?: boolean;
  /** Skip delegator fetch if no wallet connected. Defaults to true (will skip). */
  requireWallet?: boolean;
}

/**
 * Composite hook that fetches all restaking data in one place.
 * Handles indexer unavailability and provides unified loading/error states.
 *
 * @example
 * ```tsx
 * const {
 *   assets,
 *   delegator,
 *   isLoading,
 *   hasError,
 *   dataSource,
 * } = useRestakingData();
 *
 * if (isLoading) return <Spinner />;
 * if (hasError) return <ErrorMessage />;
 *
 * // Use data...
 * ```
 */
export const useRestakingData = (
  options?: UseRestakingDataOptions,
): RestakingDataState => {
  const { enabled = true, requireWallet = true } = options ?? {};
  const { address, isConnected } = useAccount();

  // Get indexer status
  const { isHealthy, isCheckingHealth, dataSource } =
    useIndexerStatusStandalone();

  // Fetch assets (has on-chain fallback)
  const {
    assets,
    assetList,
    isLoading: isLoadingAssets,
    refetch: refetchAssetsInternal,
  } = useRestakeAssets({ enabled });

  // Get token addresses from assets for on-chain delegator query
  const tokenAddresses = useMemo(() => {
    return assetList.map((asset) => asset.id);
  }, [assetList]);

  // Fetch restaking assets from indexer (for TVL/protocol stats)
  const { data: restakingAssets, refetch: refetchRestakingAssetsInternal } =
    useRestakingAssets({
      enabled: enabled && isHealthy && !isCheckingHealth,
    });

  // Fetch delegator info from GraphQL (for rich data like delegations, requests)
  const shouldFetchDelegator = enabled && (!requireWallet || isConnected);
  const {
    data: graphqlDelegator,
    isLoading: isLoadingGraphqlDelegator,
    isError: hasDelegatorError,
    error: delegatorError,
    refetch: refetchDelegatorInternal,
  } = useDelegator(address, {
    enabled: shouldFetchDelegator,
  });

  // ALWAYS fetch delegator deposit data from on-chain for accurate amounts
  // The indexer may have stale delegatedAmount values
  const {
    data: onChainDelegator,
    isLoading: isLoadingOnChainDelegator,
    refetch: refetchOnChainDelegatorInternal,
  } = useOnChainDelegator(address, {
    tokenAddresses,
    enabled: shouldFetchDelegator && tokenAddresses.length > 0,
  });

  // Merge data: use on-chain for accurate deposit/delegation amounts,
  // GraphQL for rich data (delegations, requests, etc.)
  const delegator = useMemo<Delegator | null>(() => {
    // If we have on-chain data, use it for asset positions (source of truth)
    if (onChainDelegator) {
      // If we also have GraphQL data, merge them
      if (graphqlDelegator) {
        return {
          ...graphqlDelegator,
          // Override with on-chain data for accurate amounts
          assetPositions: onChainDelegator.assetPositions,
          totalDeposited: onChainDelegator.totalDeposited,
          totalDelegated: onChainDelegator.totalDelegated,
        };
      }
      // Only on-chain data available
      return onChainDelegator;
    }
    return graphqlDelegator ?? null;
  }, [onChainDelegator, graphqlDelegator]);

  const isLoadingDelegator = isLoadingOnChainDelegator || isLoadingGraphqlDelegator;

  // Unified loading state
  const isLoading = useMemo(() => {
    if (isCheckingHealth) return true;
    if (isLoadingAssets) return true;
    if (shouldFetchDelegator && isLoadingDelegator) return true;
    return false;
  }, [
    isCheckingHealth,
    isLoadingAssets,
    isLoadingDelegator,
    shouldFetchDelegator,
  ]);

  // Unified error state
  const hasError = hasDelegatorError;
  const error = delegatorError as Error | null;

  // Refetch functions
  const refetchAssets = async () => {
    await refetchAssetsInternal();
  };

  const refetchDelegator = async () => {
    // Always refetch both sources
    await Promise.all([
      refetchOnChainDelegatorInternal(),
      refetchDelegatorInternal(),
    ]);
  };

  const refetchAll = async () => {
    await Promise.all([
      refetchAssetsInternal(),
      refetchOnChainDelegatorInternal(),
      refetchDelegatorInternal(),
      refetchRestakingAssetsInternal(),
    ]);
  };

  return {
    // Assets
    assets,
    assetList,
    restakingAssets: restakingAssets ?? null,

    // Delegator
    delegator: delegator ?? null,

    // Loading states
    isLoading,
    isLoadingAssets,
    isLoadingDelegator: shouldFetchDelegator ? isLoadingDelegator : false,

    // Error states
    hasError,
    error,

    // Data source info
    dataSource,
    isIndexerHealthy: isHealthy,

    // Refresh functions
    refetchAssets,
    refetchDelegator,
    refetchAll,
  };
};

/**
 * Simplified hook for dashboard/overview components.
 * Returns computed values ready for display.
 */
export const useRestakingOverview = () => {
  const data = useRestakingData();

  // Calculate total deposited value
  const totalDeposited = useMemo(() => {
    if (!data.delegator) return BigInt(0);
    return data.delegator.assetPositions.reduce(
      (sum, pos) => sum + pos.totalDeposited,
      BigInt(0),
    );
  }, [data.delegator]);

  // Calculate total delegated value
  const totalDelegated = useMemo(() => {
    if (!data.delegator) return BigInt(0);
    return data.delegator.assetPositions.reduce(
      (sum, pos) => sum + pos.delegatedAmount,
      BigInt(0),
    );
  }, [data.delegator]);

  // Get positions with non-zero balances
  const positions = useMemo(() => {
    if (!data.delegator || !data.assets) return [];
    return data.delegator.assetPositions
      .filter((pos) => pos.totalDeposited > BigInt(0))
      .map((pos) => {
        const asset = data.assets?.get(pos.token as Address);
        return {
          token: pos.token,
          symbol: asset?.metadata.symbol ?? 'Unknown',
          decimals: asset?.metadata.decimals ?? 18,
          deposited: pos.totalDeposited,
          delegated: pos.delegatedAmount,
          locked: pos.lockedAmount,
        };
      });
  }, [data.delegator, data.assets]);

  // Count pending requests
  const pendingRequestsCount = useMemo(() => {
    if (!data.delegator) return 0;
    return (
      data.delegator.withdrawRequests.length +
      data.delegator.unstakeRequests.length
    );
  }, [data.delegator]);

  // Protocol TVL from restaking assets
  const protocolTvl = useMemo(() => {
    if (!data.restakingAssets) return BigInt(0);
    return data.restakingAssets.reduce(
      (sum, asset) => sum + asset.currentDeposits,
      BigInt(0),
    );
  }, [data.restakingAssets]);

  return {
    ...data,
    // Computed values
    totalDeposited,
    totalDelegated,
    positions,
    pendingRequestsCount,
    protocolTvl,
    assetCount: data.restakingAssets?.length ?? 0,
  };
};

export default useRestakingData;
