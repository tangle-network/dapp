/**
 * Unified hook for fetching restaking assets with automatic fallback.
 * Uses GraphQL indexer when available, falls back to on-chain queries.
 */

import { useDataSource } from '../../context/DataSourceContext';
import { useRestakeAssets as useGraphQLRestakeAssets } from '../graphql/useRestakeAssets';
import { useOnChainRestakeAssets } from './useOnChainRestakeAssets';
import type {
  RestakeAsset,
  RestakeAssetMap,
} from '../graphql/useRestakeAssets';

export interface UnifiedRestakeAssetsResult {
  /** Map of assets by token address */
  assets: RestakeAssetMap | null;
  /** Array of all assets */
  assetList: RestakeAsset[];
  /** Whether asset data is loading */
  isLoading: boolean;
  /** Whether balance data is loading */
  isLoadingBalances: boolean;
  /** Refetch all data */
  refetch: () => Promise<void>;
  /** Refetch just balances */
  refetchBalances: () => Promise<void>;
  /** Current data source being used */
  source: 'graphql' | 'onchain' | 'checking';
  /** Whether the indexer is available */
  isIndexerAvailable: boolean;
}

/**
 * Unified hook that automatically selects the best data source for restaking assets.
 *
 * - Uses GraphQL indexer when it's healthy and available
 * - Falls back to on-chain queries when indexer is down
 * - For local development, prefers on-chain if indexer is unavailable
 *
 * @example
 * ```tsx
 * const { assets, isLoading, source } = useUnifiedRestakeAssets();
 *
 * if (isLoading) return <Spinner />;
 *
 * // Show data source indicator
 * <Badge>{source}</Badge>
 *
 * // Use assets
 * assets?.forEach((asset) => {
 *   console.log(asset.metadata.symbol, asset.balance);
 * });
 * ```
 */
export const useUnifiedRestakeAssets = (): UnifiedRestakeAssetsResult => {
  const {
    source,
    isLoading: isCheckingSource,
    isIndexerAvailable,
  } = useDataSource();

  // Fetch from GraphQL indexer
  const graphqlResult = useGraphQLRestakeAssets({
    enabled: source === 'graphql' && !isCheckingSource,
  });

  // Fetch from on-chain (fallback)
  const onChainResult = useOnChainRestakeAssets({
    enabled: source === 'onchain' && !isCheckingSource,
  });

  // Still checking which source to use
  if (isCheckingSource) {
    return {
      assets: null,
      assetList: [],
      isLoading: true,
      isLoadingBalances: false,
      refetch: async () => {
        /* noop while checking */
      },
      refetchBalances: async () => {
        /* noop while checking */
      },
      source: 'checking',
      isIndexerAvailable,
    };
  }

  // Use the appropriate result based on data source
  if (source === 'graphql') {
    return {
      assets: graphqlResult.assets,
      assetList: graphqlResult.assetList,
      isLoading: graphqlResult.isLoading,
      isLoadingBalances: graphqlResult.isLoadingBalances,
      refetch: graphqlResult.refetch,
      refetchBalances: graphqlResult.refetchBalances,
      source: 'graphql',
      isIndexerAvailable,
    };
  }

  // On-chain fallback
  return {
    assets: onChainResult.assets,
    assetList: onChainResult.assetList,
    isLoading: onChainResult.isLoading,
    isLoadingBalances: onChainResult.isLoadingBalances,
    refetch: onChainResult.refetch,
    refetchBalances: onChainResult.refetchBalances,
    source: 'onchain',
    isIndexerAvailable,
  };
};

export default useUnifiedRestakeAssets;
