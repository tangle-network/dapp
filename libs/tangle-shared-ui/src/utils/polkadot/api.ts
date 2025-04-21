import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { firstValueFrom } from 'rxjs';
import { tangleRpc, tangleTypes } from '@tangle-network/tangle-substrate-types';

const apiPromiseCache = new Map<string, Promise<ApiPromise>>();
const apiRxCache = new Map<string, Promise<ApiRx>>();
const injectorCache = new Map<string, InjectedExtension>();

async function getOrCacheApiVariant<T extends ApiPromise | ApiRx>(
  endpoints: string | string[],
  cache: Map<string, Promise<T>>,
  factory: () => Promise<T>,
): Promise<T> {
  const cacheKey = Array.isArray(endpoints)
    ? [...endpoints].sort().join(',')
    : endpoints;

  const cachedInstance = cache.get(cacheKey);

  if (cachedInstance !== undefined) {
    return cachedInstance;
  }

  const newInstancePromise = factory();

  cache.set(cacheKey, newInstancePromise);

  try {
    const newInstance = await newInstancePromise;

    newInstance.once('connected', () => {
      console.debug(
        'Created and connected new API instance for endpoints:',
        endpoints,
      );
    });

    newInstance.on('error', (error) => {
      console.error(
        'API instance error for endpoints:',
        endpoints,
        error instanceof Error ? error.message : error,
      );
    });

    newInstance.on('disconnected', () => {
      console.warn('API instance disconnected for endpoints:', endpoints);
    });

    return newInstance;
  } catch (error) {
    console.error(
      'Failed to create API instance for endpoints:',
      endpoints,
      error,
    );
    cache.delete(cacheKey);
    throw error;
  }
}

export const getApiPromise: (
  endpoints: string | string[],
) => Promise<ApiPromise> = async (endpoints: string | string[]) => {
  return getOrCacheApiVariant(endpoints, apiPromiseCache, async () => {
    const provider = new WsProvider(endpoints);

    return ApiPromise.create({
      provider,
      noInitWarn: true,
      rpc: tangleRpc,
      types: tangleTypes,
    });
  });
};

export const getApiRx = async (
  endpoints: string | string[],
): Promise<ApiRx> => {
  return getOrCacheApiVariant(endpoints, apiRxCache, async () => {
    const provider = new WsProvider(endpoints);

    const api = new ApiRx({
      provider,
      noInitWarn: true,
      rpc: tangleRpc,
      types: tangleTypes,
    });

    return firstValueFrom(api.isReady);
  });
};

export const findInjectorForAddress = async (
  address: string,
): Promise<InjectedExtension | null> => {
  const { web3Enable, web3EnablePromise, web3FromAddress } = await import(
    '@polkadot/extension-dapp'
  );

  const cachedInjector = injectorCache.get(address);

  // Prevent multiple redundant initialization calls by
  // caching the injector for the given address.
  if (cachedInjector !== undefined) {
    return cachedInjector;
  }

  const extensions = await (web3EnablePromise !== null
    ? web3EnablePromise
    : web3Enable('Tangle'));

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
