import { useQuery } from '@tanstack/react-query';
import {
  getEnvioEndpoint,
  getEnvioNetworkFromChainId,
  type EnvioNetwork,
} from './executeEnvioGraphQL';
import { CACHE_CONFIG } from '../constants/cacheConfig';

/**
 * Check if the Envio GraphQL indexer is healthy and responding.
 */
export const checkEnvioHealth = async (
  network?: EnvioNetwork,
): Promise<boolean> => {
  const endpoint = getEnvioEndpoint(network);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });

    return response.ok;
  } catch {
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
