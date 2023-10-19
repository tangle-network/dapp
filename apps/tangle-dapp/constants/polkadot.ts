import { ApiPromise, WsProvider } from '@polkadot/api';
import { TANGLE_RPC_ENDPOINT } from '@webb-tools/webb-ui-components/constants';

export const getPolkadotApi = async (
  endpoint: string = TANGLE_RPC_ENDPOINT
): Promise<ApiPromise | undefined> => {
  try {
    const wsProvider = new WsProvider(endpoint);
    const apiPromise = await ApiPromise.create({ provider: wsProvider });

    return apiPromise;
  } catch (e) {
    console.error(e);
    return undefined;
  }
};
