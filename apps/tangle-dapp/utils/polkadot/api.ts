import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { TANGLE_RPC_ENDPOINT as TESTNET_RPC_ENDPOINT } from '@webb-tools/webb-ui-components/constants';
import { firstValueFrom } from 'rxjs';

const TANGLE_RPC_ENDPOINT = process.env['USING_LOCAL_TANGLE']
  ? 'ws://127.0.0.1:9944'
  : TESTNET_RPC_ENDPOINT;

const apiPromiseCache = new Map<string, ApiPromise>();

export const getPolkadotApiPromise: (
  endpoint?: string
) => Promise<ApiPromise | undefined> = async (
  endpoint: string = TANGLE_RPC_ENDPOINT
) => {
  if (apiPromiseCache.has(endpoint)) {
    return apiPromiseCache.get(endpoint);
  }

  const wsProvider = new WsProvider(endpoint);
  const apiPromise = await ApiPromise.create({
    provider: wsProvider,
    noInitWarn: true,
  });

  apiPromiseCache.set(endpoint, apiPromise);

  return apiPromise;
};

const apiRxCache = new Map<string, ApiRx>();

export const getPolkadotApiRx = async (
  endpoint: string = TANGLE_RPC_ENDPOINT
): Promise<ApiRx | undefined> => {
  if (apiRxCache.has(endpoint)) {
    return apiRxCache.get(endpoint);
  }

  const provider = new WsProvider(endpoint);
  const api = new ApiRx({
    provider,
    noInitWarn: true,
  });

  const apiRx = await firstValueFrom(api.isReady);
  apiRxCache.set(endpoint, apiRx);

  return apiRx;
};

export const getInjector = async (address: string) => {
  const { web3Enable, web3FromAddress } = await import(
    '@polkadot/extension-dapp'
  );
  const extensions = await web3Enable('Tangle');

  if (extensions.length === 0) {
    return undefined;
  }

  const injector = await web3FromAddress(address);
  return injector;
};
