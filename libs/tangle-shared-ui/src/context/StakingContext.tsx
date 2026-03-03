/* eslint-disable react-refresh/only-export-components */

/**
 * StakingContext - shared state management for staking data.
 *
 * This context provides a single source of truth for staking-related data,
 * hydrating state efficiently and sharing it across components.
 *
 * Data sources:
 * 1. GraphQL indexer (Envio) - primary source when available
 * 2. On-chain fallback - used when indexer is unavailable
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type FC,
  type ReactNode,
} from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Address } from 'viem';
import EVMChainId from '@tangle-network/dapp-types/EVMChainId';
import { useEnvioHealthCheckByChainId } from '../utils/checkEnvioHealth';
import {
  useProtocolStakingAssets,
  type ProtocolStakingAsset,
} from '../data/graphql/useProtocolStakingAssets';
import {
  useStakingAssets,
  type StakingAsset,
  type StakingAssetMap,
} from '../data/graphql/useStakingAssets';
import { useDelegator, type Delegator } from '../data/graphql/useDelegator';
import { useOnChainDelegator } from '../data/staking/useOnChainDelegator';
import { useOperatorMap, type Operator } from '../data/graphql/useOperators';
import {
  useProtocolConfig,
  type ProtocolConfig,
} from '../data/graphql/useProtocolConfig';

export type DataSource = 'graphql' | 'onchain' | 'loading';

export interface StakingContextValue {
  // Data source info
  source: DataSource;
  isIndexerAvailable: boolean;
  isLocalDev: boolean;

  // Staking assets (token configs from protocol)
  stakingAssets: ProtocolStakingAsset[] | null;
  isLoadingStakingAssets: boolean;

  // Staking assets with balances (combined asset info)
  assets: StakingAssetMap | null;
  assetList: StakingAsset[];
  isLoadingAssets: boolean;
  isLoadingBalances: boolean;
  refetchAssets: () => Promise<void>;
  refetchBalances: () => Promise<void>;

  // Delegator info (user's positions)
  delegator: Delegator | null;
  isLoadingDelegator: boolean;
  refetchDelegator: () => Promise<void>;

  // Operators
  operatorMap: Map<Address, Operator> | null;
  operatorList: Operator[];
  isLoadingOperators: boolean;
  refetchOperators: () => Promise<void>;

  // Protocol config
  protocolConfig: ProtocolConfig | null;
  currentRound: bigint | null;
  isLoadingProtocol: boolean;

  // Utility: refetch all data
  refetchAll: () => Promise<void>;
}

const StakingContext = createContext<StakingContextValue | null>(null);

interface StakingProviderProps {
  children: ReactNode;
}

/**
 * StakingProvider - Centralized data provider for staking functionality.
 *
 * Wrap your staking pages/components with this provider to enable
 * efficient data sharing and avoid redundant fetches.
 *
 * @example
 * ```tsx
 * <StakingProvider>
 *   <StakingTabContent tab={tab} />
 * </StakingProvider>
 * ```
 */
export const StakingProvider: FC<StakingProviderProps> = ({ children }) => {
  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const isLocalDev =
    chainId === EVMChainId.BaseSepolia || chainId === EVMChainId.AnvilLocal;

  // Check indexer health
  const { data: isHealthy, isLoading: isCheckingHealth } =
    useEnvioHealthCheckByChainId(chainId);

  const isIndexerAvailable = !isCheckingHealth && !!isHealthy;
  const source: DataSource = isCheckingHealth
    ? 'loading'
    : isIndexerAvailable
      ? 'graphql'
      : 'onchain';

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.debug('[StakingContext] Data source:', {
      source,
      chainId,
      isLocalDev,
      isIndexerAvailable,
      isCheckingHealth,
    });
  }

  // Fetch protocol staking assets (token configurations).
  const {
    data: protocolStakingAssets,
    isLoading: isLoadingProtocolStakingAssets,
    refetch: refetchProtocolStakingAssets,
  } = useProtocolStakingAssets({
    enabledOnly: true,
    enabled: !isCheckingHealth,
  });

  // Fetch staking assets with metadata and balances (fallback handled internally).
  const {
    assets,
    assetList,
    isLoading: isLoadingAssets,
    isLoadingBalances,
    refetch: refetchAssets,
    refetchBalances,
  } = useStakingAssets({
    enabled: !isCheckingHealth,
  });

  // Get token addresses from assets for on-chain delegator query
  const tokenAddresses = useMemo(() => {
    return assetList.map((asset: StakingAsset) => asset.id);
  }, [assetList]);

  // Fetch delegator info from GraphQL (for rich data like delegations, requests)
  const {
    data: graphqlDelegator,
    isLoading: isLoadingGraphqlDelegator,
    refetch: refetchGraphqlDelegator,
  } = useDelegator(userAddress);

  // ALWAYS fetch delegator deposit data from on-chain for accurate amounts
  // The indexer may have stale delegatedAmount values
  const {
    data: onChainDelegator,
    isLoading: isLoadingOnChainDelegator,
    refetch: refetchOnChainDelegator,
  } = useOnChainDelegator(userAddress, {
    tokenAddresses,
    enabled: !!userAddress && tokenAddresses.length > 0,
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

  const isLoadingDelegator =
    isLoadingOnChainDelegator || isLoadingGraphqlDelegator;

  const refetchDelegator = useCallback(async () => {
    await Promise.all([refetchOnChainDelegator(), refetchGraphqlDelegator()]);
  }, [refetchOnChainDelegator, refetchGraphqlDelegator]);

  // Fetch operators
  const {
    data: operatorMap,
    isLoading: isLoadingOperators,
    refetch: refetchOperators,
  } = useOperatorMap({ status: 'ACTIVE' });

  // Fetch protocol config
  const { data: protocolConfigData, isLoading: isLoadingProtocolConfig } =
    useProtocolConfig();
  const protocolConfig =
    protocolConfigData && protocolConfigData.isSupported
      ? protocolConfigData
      : null;
  const currentRound = protocolConfig?.currentRound ?? null;
  const isLoadingProtocol = isLoadingProtocolConfig;

  // Convert operator map to list
  const operatorList = useMemo(() => {
    return operatorMap ? Array.from(operatorMap.values()) : [];
  }, [operatorMap]);

  // Shared refetch function
  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchProtocolStakingAssets(),
      refetchAssets(),
      refetchDelegator(),
      refetchOperators(),
    ]);
  }, [
    refetchProtocolStakingAssets,
    refetchAssets,
    refetchDelegator,
    refetchOperators,
  ]);

  // Debug logging for assets
  if (process.env.NODE_ENV === 'development' && !isLoadingAssets) {
    console.debug('[StakingContext] Assets loaded:', {
      source,
      assetCount: assetList.length,
      stakingAssetsCount: protocolStakingAssets?.length ?? 0,
      assets: assetList.map((a: StakingAsset) => ({
        symbol: a.metadata.symbol,
        balance: a.balance?.toString() ?? 'null',
      })),
    });
  }

  const value = useMemo<StakingContextValue>(
    () => ({
      source,
      isIndexerAvailable,
      isLocalDev,

      stakingAssets: protocolStakingAssets ?? null,
      isLoadingStakingAssets: isLoadingProtocolStakingAssets,

      assets,
      assetList,
      isLoadingAssets,
      isLoadingBalances,
      refetchAssets: async () => {
        await refetchAssets();
      },
      refetchBalances: async () => {
        await refetchBalances();
      },

      delegator: delegator ?? null,
      isLoadingDelegator,
      refetchDelegator: async () => {
        await refetchDelegator();
      },

      operatorMap: operatorMap ?? null,
      operatorList,
      isLoadingOperators,
      refetchOperators: async () => {
        await refetchOperators();
      },

      protocolConfig: protocolConfig ?? null,
      currentRound,
      isLoadingProtocol,

      refetchAll,
    }),
    [
      source,
      isIndexerAvailable,
      isLocalDev,
      protocolStakingAssets,
      isLoadingProtocolStakingAssets,
      assets,
      assetList,
      isLoadingAssets,
      isLoadingBalances,
      refetchAssets,
      refetchBalances,
      delegator,
      isLoadingDelegator,
      refetchDelegator,
      operatorMap,
      operatorList,
      isLoadingOperators,
      refetchOperators,
      protocolConfig,
      currentRound,
      isLoadingProtocol,
      refetchAll,
    ],
  );

  return (
    <StakingContext.Provider value={value}>{children}</StakingContext.Provider>
  );
};

/**
 * Hook to access the staking context.
 * Must be used within a StakingProvider.
 */
export const useStakingContext = (): StakingContextValue => {
  const context = useContext(StakingContext);
  if (!context) {
    throw new Error('useStakingContext must be used within a StakingProvider');
  }
  return context;
};

/**
 * Hook to check if staking context is available.
 * Returns null if used outside of StakingProvider.
 */
export const useOptionalStakingContext = (): StakingContextValue | null => {
  return useContext(StakingContext);
};

/**
 * Hook to get just the assets from context.
 * Provides a focused interface for deposit/withdraw forms.
 */
export const useStakingAssetsFromContext = () => {
  const {
    assets,
    assetList,
    isLoadingAssets,
    isLoadingBalances,
    refetchBalances,
  } = useStakingContext();

  return {
    assets,
    assetList,
    isLoading: isLoadingAssets,
    isLoadingBalances,
    refetchBalances,
  };
};

/**
 * Hook to get delegator info from context.
 * Provides user's positions, delegations, and pending requests.
 */
export const useDelegatorFromContext = () => {
  const { delegator, isLoadingDelegator, refetchDelegator } =
    useStakingContext();

  return {
    delegator,
    isLoading: isLoadingDelegator,
    refetch: refetchDelegator,
  };
};

/**
 * Hook to get operators from context.
 */
export const useOperatorsFromContext = () => {
  const { operatorMap, operatorList, isLoadingOperators, refetchOperators } =
    useStakingContext();

  return {
    operatorMap,
    operatorList,
    isLoading: isLoadingOperators,
    refetch: refetchOperators,
  };
};

export default StakingContext;
