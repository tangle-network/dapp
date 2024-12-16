import { Maybe } from '@webb-tools/dapp-types/utils/types';
import { FC, PropsWithChildren, useMemo, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { getApiPromise, getApiRx } from '../utils/polkadot/api';
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

  const { rpcEndpoint: rpcFromStore } = useNetworkStore();

  const rpcEndpoint = useMemo(() => {
    if (customRpc === undefined || customRpc.length === 0) return rpcFromStore;

    return customRpc;
  }, [customRpc, rpcFromStore]);

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
        customRpc,
        setCustomRpc,
      }}
    >
      {children}
    </PolkadotApiContext.Provider>
  );
};

export default PolkadotApiProvider;
