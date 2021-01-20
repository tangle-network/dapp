import React, { useState, useEffect, useCallback, FC } from 'react';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { web3FromAddress } from '@polkadot/extension-dapp';
import { ApiRx, WsProvider } from '@polkadot/api';
import { Fixed18 } from '@acala-network/app-util';

import { BareProps } from '@webb-dapp/ui-components/types';

export interface CrossChainContextData {
  connected: boolean;
  error: boolean;
  getNativeBalance: (account: string) => Observable<Fixed18>;
  getApi: () => ApiRx;
  setSigner: (address: string) => Promise<boolean>;
}

export const CrossChainContext = React.createContext<CrossChainContextData>(({} as any) as CrossChainContextData);

const ROCOCOENDPOINT = 'wss://rococo-rpc.polkadot.io';

export const CrossChainProvider: FC<BareProps> = ({ children }) => {
  const [api, setApi] = useState<ApiRx>();
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const wsProvider = new WsProvider(ROCOCOENDPOINT);

    const subscriber = ApiRx.create({ provider: wsProvider }).subscribe({
      error: () => {
        setError(true);
        setConnected(false);
      },
      next: (api: ApiRx) => {
        setApi(api);
        setConnected(true);
        setError(false);
      }
    });

    return (): void => {
      subscriber.unsubscribe();
    };
  }, []);

  const getApi = useCallback((): ApiRx => {
    return api as ApiRx;
  }, [api]);

  const getNativeBalance = useCallback(
    (account: string): Observable<Fixed18> => {
      if (!api) return of(Fixed18.ZERO);

      return combineLatest([api.rpc.system.properties(), api.query.system.account(account)]).pipe(
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        map(([_, result]) => {
          if (result.isEmpty) return Fixed18.ZERO;

          return Fixed18.fromParts(result.data.free.toString() + '000000');
        })
      );
    },
    [api]
  );

  const setSigner = useCallback(
    async (address: string) => {
      if (!api) return false;

      try {
        const injector = await web3FromAddress(address);

        api.setSigner(injector.signer);
      } catch (e) {
        return false;
      }

      return true;
    },
    [api]
  );

  return (
    <CrossChainContext.Provider
      value={{
        connected,
        error,
        getApi,
        getNativeBalance,
        setSigner
      }}
    >
      {children}
    </CrossChainContext.Provider>
  );
};
