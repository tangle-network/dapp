import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import { TANGLE_RPC_ENDPOINT } from '@webb-tools/webb-ui-components/constants';
import { firstValueFrom } from 'rxjs';

const apiPromiseCache = new Map<string, ApiPromise>();

export const getPolkadotApiPromise = async (
  endpoint: string = TANGLE_RPC_ENDPOINT
): Promise<ApiPromise | undefined> => {
  if (apiPromiseCache.has(endpoint)) {
    return apiPromiseCache.get(endpoint);
  }

  try {
    const wsProvider = new WsProvider(endpoint);
    const apiPromise = await ApiPromise.create({
      provider: wsProvider,
      noInitWarn: true,
    });

    apiPromiseCache.set(endpoint, apiPromise);

    return apiPromise;
  } catch (e) {
    console.error(e);
  }
};

const apiRxCache = new Map<string, ApiRx>();

export const getPolkadotApiRx = async (
  endpoint: string = TANGLE_RPC_ENDPOINT
): Promise<ApiRx | undefined> => {
  if (apiRxCache.has(endpoint)) {
    return apiRxCache.get(endpoint);
  }

  try {
    const provider = new WsProvider(endpoint);
    const api = new ApiRx({
      provider,
      noInitWarn: true,
    });

    const apiRx = await firstValueFrom(api.isReady);
    apiRxCache.set(endpoint, apiRx);

    return apiRx;
  } catch (error) {
    console.error(error);
  }
};
