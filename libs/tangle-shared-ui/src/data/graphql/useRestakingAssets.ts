/**
 * Hook to fetch restaking assets from the Envio indexer.
 * Replaces the Substrate-based useRestakeAssets hook.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useChainId } from 'wagmi';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import type { RestakingAsset } from '../restake/types';

// Re-export for backwards compatibility
export type { RestakingAsset } from '../restake/types';

// GraphQL query for restaking assets (Hasura uses PascalCase table names)
const RESTAKING_ASSETS_QUERY = gql`
  query RestakingAssets($enabled: Boolean) {
    RestakingAsset(
      where: { enabled: { _eq: $enabled } }
      order_by: { createdAt: asc }
    ) {
      id
      token
      enabled
      minOperatorStake
      minDelegation
      depositCap
      currentDeposits
      rewardMultiplierBps
      createdAt
      updatedAt
    }
  }
`;

interface RestakingAssetsQueryResult {
  RestakingAsset: Array<{
    id: string;
    token: string;
    enabled: boolean;
    minOperatorStake: string;
    minDelegation: string;
    depositCap: string | null;
    currentDeposits: string;
    rewardMultiplierBps: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Parse restaking asset from GraphQL response
const parseRestakingAsset = (
  raw: RestakingAssetsQueryResult['RestakingAsset'][number],
): RestakingAsset => ({
  id: raw.id || raw.token,
  token: raw.token as Address,
  enabled: raw.enabled,
  minOperatorStake: BigInt(raw.minOperatorStake),
  minDelegation: BigInt(raw.minDelegation),
  depositCap: raw.depositCap ? BigInt(raw.depositCap) : null,
  currentDeposits: BigInt(raw.currentDeposits),
  rewardMultiplierBps: raw.rewardMultiplierBps,
  createdAt: BigInt(raw.createdAt),
  updatedAt: BigInt(raw.updatedAt),
});

// Fetch restaking assets
const fetchRestakingAssets = async (
  network?: EnvioNetwork,
  enabledOnly?: boolean,
): Promise<RestakingAsset[]> => {
  const result = await executeEnvioGraphQL<
    RestakingAssetsQueryResult,
    { enabled?: boolean }
  >(RESTAKING_ASSETS_QUERY, { enabled: enabledOnly }, network);

  return result.data.RestakingAsset.map(parseRestakingAsset);
};

// Hook to fetch all restaking assets
export const useRestakingAssets = (options?: {
  network?: EnvioNetwork;
  enabledOnly?: boolean;
  enabled?: boolean;
}) => {
  const { network, enabledOnly = true, enabled = true } = options ?? {};
  const chainId = useChainId();
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(chainId);

  return useQuery({
    queryKey: ['envio', 'restakingAssets', resolvedNetwork, enabledOnly],
    queryFn: () => fetchRestakingAssets(resolvedNetwork, enabledOnly),
    enabled,
    staleTime: 60_000, // 1 minute - assets don't change often
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });
};

// Hook to get restaking assets as a map (keyed by token address)
export const useRestakingAssetMap = (options?: {
  network?: EnvioNetwork;
  enabledOnly?: boolean;
  enabled?: boolean;
}) => {
  const { network, enabledOnly = true, enabled = true } = options ?? {};
  const chainId = useChainId();
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(chainId);

  return useQuery({
    queryKey: ['envio', 'restakingAssetMap', resolvedNetwork, enabledOnly],
    queryFn: async () => {
      const assets = await fetchRestakingAssets(resolvedNetwork, enabledOnly);
      const map = new Map<Address, RestakingAsset>();
      for (const asset of assets) {
        map.set(asset.token, asset);
      }
      return map;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });
};

// Hook to get restaking asset token addresses
export const useRestakingAssetIds = (options?: {
  network?: EnvioNetwork;
  enabledOnly?: boolean;
  enabled?: boolean;
}) => {
  const { data: assets, ...rest } = useRestakingAssets(options);

  return {
    ...rest,
    data: assets?.map((a) => a.token) ?? null,
  };
};
