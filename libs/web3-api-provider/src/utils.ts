import { chainsPopulated } from '@webb-tools/dapp-config';
import { ethers } from 'ethers';
import { Web3Provider } from './ext-provider';

const evmProviderCache: { [typedChainId: number]: ethers.providers.Provider } =
  {};

// For the fetching currency on chain effect
export const evmProviderFactory = async (
  typedChainId: number
): Promise<ethers.providers.Provider> => {
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
};
