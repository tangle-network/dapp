import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { firstValueFrom } from 'rxjs';

async function getOrCacheApiVariant<T extends ApiPromise | ApiRx>(
  endpoint: string,
  cache: Map<string, Promise<T>>,
  factory: () => Promise<T>
): Promise<T> {
  const possiblyCachedInstance = cache.get(endpoint);

  if (possiblyCachedInstance !== undefined) {
    return possiblyCachedInstance;
  }

  // Immediately cache the promise to prevent data races
  // that would result in multiple API instances being created.
  const newInstance = factory();

  cache.set(endpoint, newInstance);

  return newInstance;
}

const apiPromiseCache = new Map<string, Promise<ApiPromise>>();

export const getPolkadotApiPromise: (
  endpoint: string
) => Promise<ApiPromise> = async (endpoint: string) => {
  return getOrCacheApiVariant(endpoint, apiPromiseCache, async () => {
    const wsProvider = new WsProvider(endpoint, false);

    return ApiPromise.create({
      provider: wsProvider,
      noInitWarn: true,
    });
  });
};

const apiRxCache = new Map<string, Promise<ApiRx>>();

export const getPolkadotApiRx = async (endpoint: string): Promise<ApiRx> => {
  return getOrCacheApiVariant(endpoint, apiRxCache, async () => {
    const provider = new WsProvider(endpoint, 1000, undefined);
    const api = new ApiRx({ provider, noInitWarn: true });

    return firstValueFrom(api.isReady);
  });
};

export const clearCaches = () => {
  for (const promise of apiPromiseCache.values()) {
    promise.then((api) => api.disconnect());
  }

  apiPromiseCache.clear();

  for (const promise of apiRxCache.values()) {
    promise.then((api) => api.disconnect());
  }

  apiRxCache.clear();
};

export const getInjector = async (address: string) => {
  const { web3Enable, web3FromAddress } = await import(
    '@polkadot/extension-dapp'
  );

  const extensions = await web3Enable('Tangle');

  // No wallet extensions installed in the browser.
  if (extensions.length === 0) {
    return null;
  }

  return web3FromAddress(address);
};
