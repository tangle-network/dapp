import { ApiPromise } from '@polkadot/api';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { PolkadotProvider } from '@webb-tools/polkadot-api-provider';
import { Web3Provider } from '@webb-tools/web3-api-provider';
import { ethers } from 'ethers';

import constants from './constants';

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

const substrateProviderCache: { [typedChainId: number]: ApiPromise } = {};

export const substrateProviderFactory = async (
  typedChainId: number
): Promise<ApiPromise> => {
  const cached = substrateProviderCache[typedChainId];
  if (cached) {
    return cached;
  }

  const chain = chainsPopulated[typedChainId];
  if (!chain) {
    throw new Error(`Chain not found for ${typedChainId}`); // Development error
  }

  return new Promise((res, rej) => {
    PolkadotProvider.getApiPromise(constants.APP_NAME, [chain.url], (error) => {
      console.error('Error in substrateProviderFactory', error);
      error.cancel();
      rej(error);
    })
      .then((apiPromise) => {
        substrateProviderCache[typedChainId] = apiPromise;

        return res(apiPromise);
      })
      .catch(rej);
  });
};
