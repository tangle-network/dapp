import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { firstValueFrom } from 'rxjs';

const apiPromiseCache = new Map<string, Promise<ApiPromise>>();
const apiRxCache = new Map<string, Promise<ApiRx>>();
const injectorCache = new Map<string, InjectedExtension>();

async function getOrCacheApiVariant<T extends ApiPromise | ApiRx>(
  endpoint: string,
  cache: Map<string, Promise<T>>,
  factory: () => Promise<T>,
): Promise<T> {
  const cachedInstance = cache.get(endpoint);

  if (cachedInstance !== undefined) {
    return cachedInstance;
  }

  // Immediately cache the promise to prevent data races
  // that would result in multiple API instances being created.
  const newInstance = factory();

  cache.set(endpoint, newInstance);

  const newInstanceAwaited = await newInstance;

  newInstanceAwaited.once('connected', () => {
    console.debug('Created new API instance for endpoint:', endpoint);
  });

  newInstanceAwaited.on('error', (error) => {
    console.debug('Got error for API instance at endpoint:', endpoint, error);
  });

  return newInstance;
}

export const getApiPromise: (endpoint: string) => Promise<ApiPromise> = async (
  endpoint: string,
) => {
  return getOrCacheApiVariant(endpoint, apiPromiseCache, async () => {
    const provider = new WsProvider(endpoint);

    return ApiPromise.create({
      provider,
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
  address: string,
): Promise<InjectedExtension | null> => {
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
