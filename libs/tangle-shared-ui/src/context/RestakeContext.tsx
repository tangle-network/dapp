/**
 * RestakeContext - Unified state management for restaking data.
 *
 * This context provides a single source of truth for all restaking-related data,
 * hydrating the state efficiently and sharing it across components. This eliminates
 * redundant fetches and ensures consistent state across the restaking UI.
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
import { useEnvioHealthCheckByChainId } from '../utils/checkEnvioHealth';
import {
  useRestakingAssets,
  type RestakingAsset,
} from '../data/graphql/useRestakingAssets';
import {
  useRestakeAssets,
  type RestakeAsset,
  type RestakeAssetMap,
} from '../data/graphql/useRestakeAssets';
import { useDelegator, type Delegator } from '../data/graphql/useDelegator';
import { useOnChainDelegator } from '../data/restake/useOnChainDelegator';
import { useOperatorMap, type Operator } from '../data/graphql/useOperators';
import {
  useProtocolConfig,
  type ProtocolConfig,
} from '../data/graphql/useProtocolConfig';
import { useCurrentRoundNumber } from '../data/graphql/useRestakingRound';

export type DataSource = 'graphql' | 'onchain' | 'loading';

interface RestakeContextValue {
  // Data source info
  source: DataSource;
  isIndexerAvailable: boolean;
  isLocalDev: boolean;

  // Restaking assets (token configs from protocol)
  restakingAssets: RestakingAsset[] | null;
  isLoadingRestakingAssets: boolean;

  // Restake assets with balances (combined asset info)
  assets: RestakeAssetMap | null;
  assetList: RestakeAsset[];
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

const RestakeContext = createContext<RestakeContextValue | null>(null);

interface RestakeProviderProps {
  children: ReactNode;
}

/**
 * RestakeProvider - Centralized data provider for restaking functionality.
 *
 * Wrap your restaking pages/components with this provider to enable
 * efficient data sharing and avoid redundant fetches.
 *
 * @example
 * ```tsx
 * <RestakeProvider>
 *   <RestakeTabContent tab={tab} />
 * </RestakeProvider>
 * ```
 */
export const RestakeProvider: FC<RestakeProviderProps> = ({ children }) => {
  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const isLocalDev = chainId === 84532 || chainId === 31337;

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
    console.debug('[RestakeContext] Data source:', {
      source,
      chainId,
      isLocalDev,
      isIndexerAvailable,
      isCheckingHealth,
    });
  }

  // Fetch restaking assets (token configurations)
  const {
    data: restakingAssets,
    isLoading: isLoadingRestakingAssets,
    refetch: refetchRestakingAssets,
  } = useRestakingAssets({
    enabledOnly: true,
    enabled: !isCheckingHealth,
  });

  // Fetch restake assets with metadata and balances (this handles fallback internally)
  const {
    assets,
    assetList,
    isLoading: isLoadingAssets,
    isLoadingBalances,
    refetch: refetchAssets,
    refetchBalances,
  } = useRestakeAssets({
    enabled: !isCheckingHealth,
  });

  // Get token addresses from assets for on-chain delegator query
  const tokenAddresses = useMemo(() => {
    return assetList.map((asset) => asset.id);
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
  const { data: protocolConfig, isLoading: isLoadingProtocolConfig } =
    useProtocolConfig();

  // Fetch current round
  const { data: currentRound, isLoading: isLoadingCurrentRound } =
    useCurrentRoundNumber();

  const isLoadingProtocol = isLoadingProtocolConfig || isLoadingCurrentRound;

  // Convert operator map to list
  const operatorList = useMemo(() => {
    return operatorMap ? Array.from(operatorMap.values()) : [];
  }, [operatorMap]);

  // Unified refetch function
  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchRestakingAssets(),
      refetchAssets(),
      refetchDelegator(),
      refetchOperators(),
    ]);
  }, [
    refetchRestakingAssets,
    refetchAssets,
    refetchDelegator,
    refetchOperators,
  ]);

  // Debug logging for assets
  if (process.env.NODE_ENV === 'development' && !isLoadingAssets) {
    console.debug('[RestakeContext] Assets loaded:', {
      source,
      assetCount: assetList.length,
      restakingAssetsCount: restakingAssets?.length ?? 0,
      assets: assetList.map((a) => ({
        symbol: a.metadata.symbol,
        balance: a.balance?.toString() ?? 'null',
      })),
    });
  }

  const value = useMemo<RestakeContextValue>(
    () => ({
      source,
      isIndexerAvailable,
      isLocalDev,

      restakingAssets: restakingAssets ?? null,
      isLoadingRestakingAssets,

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
      currentRound: currentRound ?? null,
      isLoadingProtocol,

      refetchAll,
    }),
    [
      source,
      isIndexerAvailable,
      isLocalDev,
      restakingAssets,
      isLoadingRestakingAssets,
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
    <RestakeContext.Provider value={value}>{children}</RestakeContext.Provider>
  );
};

/**
 * Hook to access the restake context.
 * Must be used within a RestakeProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useRestakeContext = (): RestakeContextValue => {
  const context = useContext(RestakeContext);
  if (!context) {
    throw new Error('useRestakeContext must be used within a RestakeProvider');
  }
  return context;
};

/**
 * Hook to check if restake context is available.
 * Returns null if used outside of RestakeProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useOptionalRestakeContext = (): RestakeContextValue | null => {
  return useContext(RestakeContext);
};

/**
 * Hook to get just the assets from context.
 * Provides a focused interface for deposit/withdraw forms.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useRestakeAssetsFromContext = () => {
  const {
    assets,
    assetList,
    isLoadingAssets,
    isLoadingBalances,
    refetchBalances,
  } = useRestakeContext();

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
// eslint-disable-next-line react-refresh/only-export-components
export const useDelegatorFromContext = () => {
  const { delegator, isLoadingDelegator, refetchDelegator } =
    useRestakeContext();

  return {
    delegator,
    isLoading: isLoadingDelegator,
    refetch: refetchDelegator,
  };
};

/**
 * Hook to get operators from context.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useOperatorsFromContext = () => {
  const { operatorMap, operatorList, isLoadingOperators, refetchOperators } =
    useRestakeContext();

  return {
    operatorMap,
    operatorList,
    isLoading: isLoadingOperators,
    refetch: refetchOperators,
  };
};

export default RestakeContext;
