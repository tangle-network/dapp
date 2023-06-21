import { ApiPromise } from '@polkadot/api';
import { executorWithTimeout } from '@webb-tools/browser-utils';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { PolkadotProvider } from '../ext-provider/polkadot-provider';

const substrateProviderCache: { [typedChainId: number]: ApiPromise } = {};

const substrateProviderFactory = async (
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

  return executorWithTimeout(
    new Promise<ApiPromise>((res, rej) => {
      PolkadotProvider.getApiPromise(
        '',
        [chain.url],
        (error) => {
          error.cancel();
          rej(error);
        },
        { ignoreLog: true }
      )
        .then((apiPromise) => {
          substrateProviderCache[typedChainId] = apiPromise;

          return res(apiPromise);
        })
        .catch(rej);
    })
  );
};

export default substrateProviderFactory;
