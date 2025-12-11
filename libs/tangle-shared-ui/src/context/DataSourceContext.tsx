/**
 * DataSourceContext - Manages data source selection based on indexer availability.
 * Automatically switches between GraphQL indexer and on-chain queries.
 */

import {
  createContext,
  useContext,
  useMemo,
  type FC,
  type ReactNode,
} from 'react';
import { useChainId } from 'wagmi';
import { useEnvioHealthCheckByChainId } from '../utils/checkEnvioHealth';

export type DataSource = 'graphql' | 'onchain';

interface DataSourceContextValue {
  /** Current data source being used */
  source: DataSource;
  /** Whether the GraphQL indexer is available and healthy */
  isIndexerAvailable: boolean;
  /** Whether we're still checking indexer health */
  isLoading: boolean;
  /** Whether we're in local development mode */
  isLocalDev: boolean;
}

const DataSourceContext = createContext<DataSourceContextValue>({
  source: 'graphql',
  isIndexerAvailable: true,
  isLoading: true,
  isLocalDev: false,
});

interface DataSourceProviderProps {
  children: ReactNode;
  /** Force a specific data source (useful for testing) */
  forceSource?: DataSource;
}

/**
 * Provider that determines which data source to use based on indexer availability.
 * Wrap your app with this to enable automatic fallback to on-chain queries.
 */
export const DataSourceProvider: FC<DataSourceProviderProps> = ({
  children,
  forceSource,
}) => {
  const chainId = useChainId();
  const isLocalDev = chainId === 84532 || chainId === 31337;

  const { data: isHealthy, isLoading } = useEnvioHealthCheckByChainId(chainId);

  const value = useMemo<DataSourceContextValue>(() => {
    // If forced, use that source
    if (forceSource) {
      return {
        source: forceSource,
        isIndexerAvailable: forceSource === 'graphql',
        isLoading: false,
        isLocalDev,
      };
    }

    // If still loading, assume graphql is available
    if (isLoading) {
      return {
        source: 'graphql',
        isIndexerAvailable: true,
        isLoading: true,
        isLocalDev,
      };
    }

    // Use indexer if healthy, otherwise fall back to on-chain
    return {
      source: isHealthy ? 'graphql' : 'onchain',
      isIndexerAvailable: !!isHealthy,
      isLoading: false,
      isLocalDev,
    };
  }, [forceSource, isHealthy, isLoading, isLocalDev]);

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
};

/**
 * Hook to access the current data source context.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useDataSource = (): DataSourceContextValue => {
  return useContext(DataSourceContext);
};

/**
 * Hook to check if we should use on-chain queries as fallback.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useShouldUseOnChain = (): boolean => {
  const { source } = useDataSource();
  return source === 'onchain';
};

export default DataSourceContext;
