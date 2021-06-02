import { DimensionsProvider } from '@webb-dapp/react-environment/layout';
import { BareProps } from '@webb-dapp/ui-components/types';
import React, { FC, useEffect, useState } from 'react';

import { ApiProvider } from './ApiProvider';
import { ExtensionProvider } from './ExtensionProvider';
import { SettingProvider } from './SettingProvider';
import { StoreProvier } from './store';
import { Chain, Wallet, WebbApiProvider, WebbContext } from '@webb-dapp/react-environment/webb-context';
import { chainsConfig } from '@webb-dapp/apps/configs/wallets/chain-config';
import { walletsConfig } from '@webb-dapp/apps/configs/wallets/wallets-config';
import { WebbPolkadot } from '@webb-dapp/react-environment/api-providers/webb-polkadot-provider';

interface WebbProviderProps extends BareProps {
  applicationName: string;
  applicationVersion?: string;
}

const chains = Object.values(chainsConfig).reduce(
  (acc, chainsConfig) => ({
    ...acc,
    [chainsConfig.id]: {
      ...chainsConfig,
      wallets: Object.values(walletsConfig)
        .filter(({ supportedChainIds }) => supportedChainIds.includes(chainsConfig.id))
        .reduce(
          (acc, walletsConfig) => ({
            ...acc,
            [walletsConfig.id]: {
              ...walletsConfig,
            },
          }),
          {} as Record<number, Wallet>
        ),
    },
  }),
  {} as Record<number, Chain>
);
export const WebbProvider: FC<WebbProviderProps> = ({ applicationName = 'Webb Dapp', children }) => {
  const [activeWallet, setActiveWallet] = useState<Wallet | undefined>(undefined);
  const [activeChain, setActiveChain] = useState<Chain | undefined>(undefined);
  const [activeApi, setActiveApi] = useState<WebbApiProvider<any> | undefined>(undefined);
  useEffect(() => {
    WebbPolkadot.init('Webb DApp', ['ws://127.0.0.1:9944']).then((provider) => {
      setActiveApi(provider);
    });
  }, []);
  return (
    <WebbContext.Provider
      value={{
        wallets: walletsConfig,
        chains: chains,
        activeWallet,
        activeChain,
        setActiveChain(id: number) {
          setActiveChain(chains[id]);
        },
        setActiveWallet(id: number) {
          setActiveWallet(walletsConfig[id]);
        },
      }}
    >
      <SettingProvider>
        <ApiProvider>
          <ExtensionProvider appName={applicationName}>
            <StoreProvier>
              <DimensionsProvider>{children}</DimensionsProvider>
            </StoreProvier>
          </ExtensionProvider>
        </ApiProvider>
      </SettingProvider>
    </WebbContext.Provider>
  );
};
