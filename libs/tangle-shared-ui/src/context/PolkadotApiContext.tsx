'use client';

import { ApiPromise } from '@polkadot/api/promise';
import { ApiRx } from '@polkadot/api/rx';
import type { Maybe } from '@tangle-network/dapp-types/utils/types';
import noop from 'lodash/noop';
import { createContext, type Dispatch, type SetStateAction } from 'react';
import { Prettify } from 'viem/chains';

export type PolkadotApiContextProps = Prettify<{
  apiPromise: ApiPromise | null;
  apiPromiseLoading: boolean;
  apiPromiseError: Error | null;
  apiRx: ApiRx | null;
  apiRxLoading: boolean;
  apiRxError: Error | null;
  customRpc?: Maybe<string>;
  setCustomRpc: Dispatch<SetStateAction<Maybe<string>>>;
}>;

export const PolkadotApiContext = createContext<PolkadotApiContextProps>({
  apiPromise: null,
  apiRx: null,
  apiPromiseLoading: false,
  apiPromiseError: null,
  apiRxLoading: false,
  apiRxError: null,
  setCustomRpc: noop,
});
