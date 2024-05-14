import { PublicClient } from 'viem';
import getViemClient from './getViemClient.js';

/**
 * Get the provider for the given typed chain id
 * @param typedChainId the typed chain id to get the provider for
 * @returns the provider for the given typed chain id
 */
function evmProviderFactory(typedChainId: number): PublicClient {
  return getViemClient(typedChainId);
}

export default evmProviderFactory;
