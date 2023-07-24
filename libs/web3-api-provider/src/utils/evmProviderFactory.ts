import { PublicClient } from 'viem';
import getViemClient from './getViemClient';

const evmProviderCache: {
  [typedChainId: number]: PublicClient;
} = {};

/**
 * Get the provider for the given typed chain id
 * @param typedChainId the typed chain id to get the provider for
 * @returns the provider for the given typed chain id
 */
async function evmProviderFactory(typedChainId: number): Promise<PublicClient> {
  const cached = evmProviderCache[typedChainId];
  if (cached) {
    return cached;
  }

  const client = getViemClient(typedChainId);

  evmProviderCache[typedChainId] = client;

  return client;
}

export default evmProviderFactory;
