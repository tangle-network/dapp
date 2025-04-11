'use client';

import { Maybe } from '@tangle-network/dapp-types/utils/types';
import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { useApiPromiseQuery } from '../hooks/useApiPromiseQuery';
import { useApiRxQuery } from '../hooks/useApiRxQuery';
import {
  DEFAULT_API_PROMISE,
  DEFAULT_API_RX,
  PolkadotApiContext,
} from './PolkadotApiContext';
import useNetworkStore from './useNetworkStore';

type Props = {
  rpcEndpoint?: string;
};

const PolkadotApiProvider: FC<PropsWithChildren<Props>> = ({ children }) => {
  const [customRpc, setCustomRpc] = useState<Maybe<string>>();
  const rpcFromStore = useNetworkStore(
    (store) => store.network2?.wsRpcEndpoint,
  );

  const rpcEndpoint = useMemo(() => {
    if (customRpc === undefined || customRpc.length === 0) return rpcFromStore;

    return customRpc;
  }, [customRpc, rpcFromStore]);

  const {
    data: apiPromise = DEFAULT_API_PROMISE,
    isLoading: apiPromiseLoading,
    error: apiPromiseError,
  } = useApiPromiseQuery(rpcEndpoint);

  const {
    data: apiRx = DEFAULT_API_RX,
    isLoading: apiRxLoading,
    error: apiRxError,
  } = useApiRxQuery(rpcEndpoint);

  return (
    <PolkadotApiContext.Provider
      value={{
        apiPromise,
        apiPromiseLoading,
        apiPromiseError,
        apiRx,
        apiRxLoading,
        apiRxError,
        customRpc,
        setCustomRpc,
      }}
    >
      {children}
    </PolkadotApiContext.Provider>
  );
};

export default PolkadotApiProvider;
