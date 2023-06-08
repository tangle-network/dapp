import { chainsPopulated } from '@webb-tools/dapp-config';
import { ethers } from 'ethers';

import { Web3Provider } from '../ext-provider/web3-provider';

const evmProviderCache: {
  [typedChainId: number]: ethers.providers.Web3Provider;
} = {};

/**
 * Get the provider for the given typed chain id
 * @param typedChainId the typed chain id to get the provider for
 * @returns the provider for the given typed chain id
 */
async function evmProviderFactory(
  typedChainId: number
): Promise<ethers.providers.Web3Provider> {
  const cached = evmProviderCache[typedChainId];
  if (cached) {
    return cached;
  }

  const chain = chainsPopulated[typedChainId];
  if (!chain) {
    throw new Error(`Chain not found for ${typedChainId}`); // Development error
  }

  const provider = Web3Provider.fromUri(chain.url).intoEthersProvider();

  evmProviderCache[typedChainId] = provider;

  return provider;
}

export default evmProviderFactory;
