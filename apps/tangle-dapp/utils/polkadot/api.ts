import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { TANGLE_RPC_ENDPOINT as TESTNET_RPC_ENDPOINT } from '@webb-tools/webb-ui-components/constants';
import { firstValueFrom } from 'rxjs';

const TANGLE_RPC_ENDPOINT = process.env['USING_LOCAL_TANGLE']
  ? 'ws://127.0.0.1:9944'
  : TESTNET_RPC_ENDPOINT;

async function getOrCacheApiVariant<T>(
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
  endpoint?: string
) => Promise<ApiPromise> = async (endpoint: string = TANGLE_RPC_ENDPOINT) => {
  return getOrCacheApiVariant(endpoint, apiPromiseCache, async () => {
    const wsProvider = new WsProvider(endpoint);

    return ApiPromise.create({
      provider: wsProvider,
      noInitWarn: true,
    });
  });
};

const apiRxCache = new Map<string, Promise<ApiRx>>();

export const getPolkadotApiRx = async (
  endpoint: string = TANGLE_RPC_ENDPOINT
): Promise<ApiRx> => {
  return getOrCacheApiVariant(endpoint, apiRxCache, async () => {
    const provider = new WsProvider(endpoint);
    const api = new ApiRx({ provider, noInitWarn: true });

    return firstValueFrom(api.isReady);
  });
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
