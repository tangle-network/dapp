'use client';

import { WsProvider } from '@polkadot/api';
import { ApiPromise } from '@polkadot/api/promise';
import { ApiRx } from '@polkadot/api/rx';
import type { Maybe } from '@webb-tools/dapp-types/utils/types';
import noop from 'lodash/noop';
import { createContext, type Dispatch, type SetStateAction } from 'react';
import { Prettify } from 'viem/chains';
import useNetworkStore from './useNetworkStore';

export type PolkadotApiContextProps = Prettify<{
  apiPromise: ApiPromise;
  apiPromiseLoading: boolean;
  apiPromiseError: Error | null;
  apiRx: ApiRx;
  apiRxLoading: boolean;
  apiRxError: Error | null;
  customRpc?: Maybe<string>;
  setCustomRpc: Dispatch<SetStateAction<Maybe<string>>>;
}>;

export const DEFAULT_ENDPOINT = useNetworkStore.getState().rpcEndpoint;

export const DEFAULT_API_PROMISE = (() => {
  try {
    return new ApiPromise({
      provider: new WsProvider(DEFAULT_ENDPOINT),
      noInitWarn: true,
    });
  } catch {
    return new ApiPromise();
  }
})();

export const DEFAULT_API_RX = (() => {
  try {
    return new ApiRx({
      provider: new WsProvider(DEFAULT_ENDPOINT),
      noInitWarn: true,
    });
  } catch {
    return new ApiRx();
  }
})();

export const PolkadotApiContext = createContext<PolkadotApiContextProps>({
  apiPromise: DEFAULT_API_PROMISE,
  apiRx: DEFAULT_API_RX,
  apiPromiseLoading: false,
  apiPromiseError: null,
  apiRxLoading: false,
  apiRxError: null,
  setCustomRpc: noop,
});
