/**
 * Composite hook for fetching staking data.
 * Combines assets, delegator info, and unified loading/error states.
 */

import { useMemo } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import {
  useStakingAssets,
  type StakingAsset,
  type StakingAssetMap,
} from '../graphql/useStakingAssets';
import { useDelegator, type Delegator } from '../graphql/useDelegator';
import {
  useProtocolStakingAssets,
  type ProtocolStakingAsset,
} from '../graphql/useProtocolStakingAssets';
import {
  useIndexerStatusStandalone,
  type DataSource,
} from '../../context/IndexerStatusContext';
import { useOnChainDelegator } from './useOnChainDelegator';

export interface StakingDataState {
  assets: StakingAssetMap | null;
  assetList: StakingAsset[];
  stakingAssets: ProtocolStakingAsset[] | null;
  /** @deprecated Legacy alias; use `stakingAssets`. */
  restakingAssets: ProtocolStakingAsset[] | null;

  delegator: Delegator | null;

  isLoading: boolean;
  isLoadingAssets: boolean;
  isLoadingDelegator: boolean;

  hasError: boolean;
  error: Error | null;

  dataSource: DataSource;
  isIndexerHealthy: boolean;

  refetchAssets: () => Promise<void>;
  refetchDelegator: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

export interface UseStakingDataOptions {
  enabled?: boolean;
  requireWallet?: boolean;
}

export const useStakingData = (
  options?: UseStakingDataOptions,
): StakingDataState => {
  const { enabled = true, requireWallet = true } = options ?? {};
  const { address, isConnected } = useAccount();

  const { isHealthy, isCheckingHealth, dataSource } =
    useIndexerStatusStandalone();

  const {
    assets,
    assetList,
    isLoading: isLoadingAssets,
    refetch: refetchAssetsInternal,
  } = useStakingAssets({ enabled });

  const tokenAddresses = useMemo(() => {
    return assetList.map((asset: StakingAsset) => asset.id);
  }, [assetList]);

  const { data: protocolStakingAssets, refetch: refetchProtocolAssetsInternal } =
    useProtocolStakingAssets({
      enabled: enabled && isHealthy && !isCheckingHealth,
    });

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

  const {
    data: onChainDelegator,
    isLoading: isLoadingOnChainDelegator,
    refetch: refetchOnChainDelegatorInternal,
  } = useOnChainDelegator(address, {
    tokenAddresses,
    enabled: shouldFetchDelegator && tokenAddresses.length > 0,
  });

  const delegator = useMemo<Delegator | null>(() => {
    if (onChainDelegator) {
      if (graphqlDelegator) {
        return {
          ...graphqlDelegator,
          assetPositions: onChainDelegator.assetPositions,
          totalDeposited: onChainDelegator.totalDeposited,
          totalDelegated: onChainDelegator.totalDelegated,
        };
      }
      return onChainDelegator;
    }
    return graphqlDelegator ?? null;
  }, [onChainDelegator, graphqlDelegator]);

  const isLoadingDelegator =
    isLoadingOnChainDelegator || isLoadingGraphqlDelegator;

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

  const hasError = hasDelegatorError;
  const error = delegatorError as Error | null;

  const refetchAssets = async () => {
    await refetchAssetsInternal();
  };

  const refetchDelegator = async () => {
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
      refetchProtocolAssetsInternal(),
    ]);
  };

  const stakingAssets = protocolStakingAssets ?? null;

  return {
    assets,
    assetList,
    stakingAssets,
    restakingAssets: stakingAssets,
    delegator: delegator ?? null,
    isLoading,
    isLoadingAssets,
    isLoadingDelegator: shouldFetchDelegator ? isLoadingDelegator : false,
    hasError,
    error,
    dataSource,
    isIndexerHealthy: isHealthy,
    refetchAssets,
    refetchDelegator,
    refetchAll,
  };
};

export const useStakingOverview = () => {
  const data = useStakingData();

  const totalDeposited = useMemo(() => {
    if (!data.delegator) return BigInt(0);
    return data.delegator.assetPositions.reduce(
      (sum, pos) => sum + pos.totalDeposited,
      BigInt(0),
    );
  }, [data.delegator]);

  const totalDelegated = useMemo(() => {
    if (!data.delegator) return BigInt(0);
    return data.delegator.assetPositions.reduce(
      (sum, pos) => sum + pos.delegatedAmount,
      BigInt(0),
    );
  }, [data.delegator]);

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

  const pendingRequestsCount = useMemo(() => {
    if (!data.delegator) return 0;
    return (
      data.delegator.withdrawRequests.length +
      data.delegator.unstakeRequests.length
    );
  }, [data.delegator]);

  const protocolTvl = useMemo(() => {
    if (!data.stakingAssets) return BigInt(0);
    return data.stakingAssets.reduce(
      (sum, asset) => sum + asset.currentDeposits,
      BigInt(0),
    );
  }, [data.stakingAssets]);

  return {
    ...data,
    totalDeposited,
    totalDelegated,
    positions,
    pendingRequestsCount,
    protocolTvl,
    assetCount: data.stakingAssets?.length ?? 0,
  };
};

export default useStakingData;
