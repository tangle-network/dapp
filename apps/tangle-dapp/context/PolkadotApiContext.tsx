'use client';

import { ApiPromise, ApiRx, WsProvider } from '@polkadot/api';
import {
  createContext,
  type FC,
  type PropsWithChildren,
  useCallback,
  useMemo,
} from 'react';
import { Prettify } from 'viem/chains';

import usePromise from '../hooks/usePromise';
import { getApiPromise, getApiRx } from '../utils/polkadot';
import useNetworkStore from './useNetworkStore';

export type PolkadotApiContextProps = Prettify<{
  apiPromise: ApiPromise;
  apiPromiseLoading: boolean;
  apiPromiseError: Error | null;
  apiRx: ApiRx;
  apiRxLoading: boolean;
  apiRxError: Error | null;
}>;

const DEFAULT_ENDPOINT = useNetworkStore.getState().rpcEndpoint;

const DEFAULT_API_PROMISE = new ApiPromise({
  provider: new WsProvider(DEFAULT_ENDPOINT),
  noInitWarn: true,
});

const DEFAULT_API_RX = new ApiRx({
  provider: new WsProvider(DEFAULT_ENDPOINT),
  noInitWarn: true,
});

export const PolkadotApiContext = createContext<PolkadotApiContextProps>({
  apiPromise: DEFAULT_API_PROMISE,
  apiRx: DEFAULT_API_RX,
  apiPromiseLoading: false,
  apiPromiseError: null,
  apiRxLoading: false,
  apiRxError: null,
});

export const PolkadotApiProvider: FC<PropsWithChildren> = ({ children }) => {
  const { rpcEndpoint } = useNetworkStore();

  const {
    result: apiPromiseOrNull,
    isLoading: apiPromiseLoading,
    error: apiPromiseError,
  } = usePromise(
    useCallback(() => getApiPromise(rpcEndpoint), [rpcEndpoint]),
    null,
  );

  const {
    result: apiRxOrNull,
    isLoading: apiRxLoading,
    error: apiRxError,
  } = usePromise(
    useCallback(() => getApiRx(rpcEndpoint), [rpcEndpoint]),
    null,
  );

  // Ensure that the default API instances are used if the custom ones are not available yet.
  const { apiPromise, apiRx } = useMemo(
    () => ({
      apiPromise:
        apiPromiseOrNull === null ? DEFAULT_API_PROMISE : apiPromiseOrNull,
      apiRx: apiRxOrNull === null ? DEFAULT_API_RX : apiRxOrNull,
    }),
    [apiPromiseOrNull, apiRxOrNull],
  );

  return (
    <PolkadotApiContext.Provider
      value={{
        apiPromise,
        apiPromiseLoading,
        apiPromiseError,
        apiRx,
        apiRxLoading,
        apiRxError,
      }}
    >
      {children}
    </PolkadotApiContext.Provider>
  );
};
