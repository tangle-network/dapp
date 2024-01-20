import { ApiPromise } from '@polkadot/api';
import useSWR from 'swr';

import { getPolkadotApiPromise } from '../constants/polkadot';
import { SWRConfigConst } from '../constants/swr';
import usePromise from './usePromise';

function usePolkadotApiValue<T>(
  swrConfig: SWRConfigConst,
  fetcher: (api: ApiPromise) => Promise<T>
) {
  // TODO: Could optimize this by using a context provider to share the Polkadot API instance between all calls to this hook. Currently, this hook will create and fetch a new Polkadot API instance for each call.
  const { result: polkadotApi, isLoading: isApiLoading } =
    usePromise<ApiPromise | null>(() => getPolkadotApiPromise(), null);

  const response = useSWR(
    swrConfig.cacheUniqueKey,
    async () => {
      if (polkadotApi === null) {
        return Promise.resolve(null);
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      return fetcher(polkadotApi);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      fallbackData: null,
      refreshInterval: swrConfig.refreshInterval,
    }
  );

  return { polkadotApi, isApiLoading, value: response.data };
}

export default usePolkadotApiValue;
