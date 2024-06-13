'use client';

import { WsProvider } from '@polkadot/api';
import { ApiPromise } from '@polkadot/api/promise';
import { ApiRx } from '@polkadot/api/rx';
import { createContext, type FC, type PropsWithChildren } from 'react';
import useSWRImmutable from 'swr/immutable';
import { Prettify } from 'viem/chains';

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
    data: apiPromise = DEFAULT_API_PROMISE,
    isLoading: apiPromiseLoading,
    error: apiPromiseError,
  } = useSWRImmutable([rpcEndpoint, 'apiPromise'], ([endpoint]) =>
    getApiPromise(endpoint),
  );

  const {
    data: apiRx = DEFAULT_API_RX,
    isLoading: apiRxLoading,
    error: apiRxError,
  } = useSWRImmutable([rpcEndpoint, 'apiRx'], ([endpoint]) =>
    getApiRx(endpoint),
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
