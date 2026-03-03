'use client';
/* eslint-disable react-refresh/only-export-components -- hooks and provider share a module for convenience */

/**
 * Centralized context for managing Envio GraphQL indexer status.
 * Provides health status, data source info, and utilities for
 * gracefully handling indexer unavailability across all apps.
 */

import {
  createContext,
  useContext,
  type FC,
  type PropsWithChildren,
  useMemo,
  useCallback,
} from 'react';
import { useChainId } from 'wagmi';
import { useEnvioHealthCheckByChainId } from '../utils/checkEnvioHealth';
import {
  getEnvioNetworkFromChainId,
  type EnvioNetwork,
} from '../utils/executeEnvioGraphQL';

// Data source type
export type DataSource = 'graphql' | 'onchain' | 'unavailable';

// Indexer status
export interface IndexerStatus {
  /** Whether the indexer is currently healthy and has data */
  isHealthy: boolean;
  /** Whether we're still checking the indexer status */
  isCheckingHealth: boolean;
  /** The current data source being used */
  dataSource: DataSource;
  /** The current Envio network based on chain ID */
  network: EnvioNetwork;
  /** Manually trigger a health check */
  checkHealth: () => Promise<boolean>;
  /** Error message if indexer is unhealthy */
  errorMessage: string | null;
}

const IndexerStatusContext = createContext<IndexerStatus | null>(null);

/**
 * Provider component that manages indexer status.
 * Should be placed high in the component tree, after WagmiProvider.
 */
export const IndexerStatusProvider: FC<PropsWithChildren> = ({ children }) => {
  const chainId = useChainId();
  const network = getEnvioNetworkFromChainId(chainId);

  // Use the shared health check hook
  const {
    data: isHealthy,
    isLoading: isCheckingHealth,
    refetch,
    error,
  } = useEnvioHealthCheckByChainId(chainId);

  // Manual health check function
  const checkHealth = useCallback(async () => {
    const result = await refetch();
    return result.data ?? false;
  }, [refetch]);

  // Determine data source
  const dataSource = useMemo<DataSource>(() => {
    if (isCheckingHealth) return 'unavailable';
    if (isHealthy === true) return 'graphql';
    return 'onchain';
  }, [isCheckingHealth, isHealthy]);

  // Error message
  const errorMessage = useMemo(() => {
    if (isCheckingHealth) return null;
    if (isHealthy === false) {
      return 'GraphQL indexer unavailable. Using on-chain data where possible.';
    }
    if (error) {
      return `Indexer error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
    return null;
  }, [isCheckingHealth, isHealthy, error]);

  const value = useMemo<IndexerStatus>(
    () => ({
      isHealthy: isHealthy ?? false,
      isCheckingHealth,
      dataSource,
      network,
      checkHealth,
      errorMessage,
    }),
    [
      isHealthy,
      isCheckingHealth,
      dataSource,
      network,
      checkHealth,
      errorMessage,
    ],
  );

  return (
    <IndexerStatusContext.Provider value={value}>
      {children}
    </IndexerStatusContext.Provider>
  );
};

/**
 * Hook to access indexer status.
 * Must be used within IndexerStatusProvider.
 */
export const useIndexerStatus = (): IndexerStatus => {
  const context = useContext(IndexerStatusContext);

  if (context === null) {
    throw new Error(
      'useIndexerStatus must be used within an IndexerStatusProvider',
    );
  }

  return context;
};

/**
 * Hook that returns whether GraphQL queries should be enabled.
 * Use this in GraphQL hooks to conditionally enable queries.
 */
export const useIsGraphQLEnabled = (): {
  enabled: boolean;
  isCheckingHealth: boolean;
} => {
  const { isHealthy, isCheckingHealth } = useIndexerStatus();

  return {
    enabled: isHealthy && !isCheckingHealth,
    isCheckingHealth,
  };
};

/**
 * Hook for checking indexer status without the context (standalone).
 * Useful for hooks that may be used outside the provider.
 */
export const useIndexerStatusStandalone = () => {
  const chainId = useChainId();
  const { data: isHealthy, isLoading: isCheckingHealth } =
    useEnvioHealthCheckByChainId(chainId);

  return {
    isHealthy: isHealthy ?? false,
    isCheckingHealth,
    dataSource: (isCheckingHealth
      ? 'unavailable'
      : isHealthy
        ? 'graphql'
        : 'onchain') as DataSource,
  };
};

export default IndexerStatusProvider;
