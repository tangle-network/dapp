import { useQuery } from '@tanstack/react-query';
import {
  getEnvioEndpoint,
  getEnvioNetworkFromChainId,
  type EnvioNetwork,
} from './executeEnvioGraphQL';
import { CACHE_CONFIG } from '../constants/cacheConfig';

/**
 * Check if the Envio GraphQL indexer is healthy and has data.
 * Not just checking if endpoint responds, but also if it has restaking assets.
 */
export const checkEnvioHealth = async (
  network?: EnvioNetwork,
): Promise<boolean> => {
  try {
    const endpoint = getEnvioEndpoint(network);

    // Query for actual restaking assets to verify indexer has data
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ RestakingAsset(limit: 1) { id } }',
      }),
      // Short timeout for health check
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return false;
    }

    // Check if we got actual data back
    const result = await response.json();
    const hasData =
      result.data?.RestakingAsset && result.data.RestakingAsset.length > 0;

    return hasData === true;
  } catch {
    // Any error means indexer is not healthy
    return false;
  }
};

/**
 * Hook to check Envio indexer health status.
 * Returns whether the indexer is available and responding.
 */
export const useEnvioHealthCheck = (network?: EnvioNetwork) => {
  return useQuery({
    queryKey: ['envioHealth', network],
    queryFn: () => checkEnvioHealth(network),
    ...CACHE_CONFIG.HEALTH,
  });
};

/**
 * Hook to check Envio health based on current chain ID.
 */
export const useEnvioHealthCheckByChainId = (chainId: number) => {
  const network = getEnvioNetworkFromChainId(chainId);
  return useEnvioHealthCheck(network);
};
