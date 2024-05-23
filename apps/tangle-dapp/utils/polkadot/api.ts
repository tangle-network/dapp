import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { firstValueFrom } from 'rxjs';

const apiPromiseCache = new Map<string, Promise<ApiPromise>>();
const apiRxCache = new Map<string, Promise<ApiRx>>();
const injectorCache = new Map<string, InjectedExtension>();

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

export const getApiPromise: (endpoint: string) => Promise<ApiPromise> = async (
  endpoint: string
) => {
  return getOrCacheApiVariant(endpoint, apiPromiseCache, async () => {
    const wsProvider = new WsProvider(endpoint);

    return ApiPromise.create({
      provider: wsProvider,
      noInitWarn: true,
    });
  });
};

export const getApiRx = async (endpoint: string): Promise<ApiRx> => {
  return getOrCacheApiVariant(endpoint, apiRxCache, async () => {
    const provider = new WsProvider(endpoint);

    const api = new ApiRx({
      provider,
      noInitWarn: true,
    });

    return firstValueFrom(api.isReady);
  });
};

export const findInjectorForAddress = async (
  address: string
): Promise<InjectedExtension | null> => {
  // TODO: This is a temporary workaround to prevent Next.js from throwing an error complaining about 'window is not defined'.
  const { web3Enable, web3FromAddress } = await import(
    '@polkadot/extension-dapp'
  );

  const cachedInjector = injectorCache.get(address);

  // Prevent multiple redundant initialization calls by
  // caching the injector for the given address.
  if (cachedInjector !== undefined) {
    return cachedInjector;
  }

  const extensions = await web3Enable('Tangle');

  // No wallet extensions installed in the browser.
  if (extensions.length === 0) {
    return null;
  }

  try {
    const injector = await web3FromAddress(address);

    injectorCache.set(address, injector);

    return injector;
  } catch {
    // Could not find an injector for the given address.
    return null;
  }
};
