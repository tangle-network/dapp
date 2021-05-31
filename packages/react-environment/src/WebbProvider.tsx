import { DimensionsProvider } from '@webb-dapp/react-environment/layout';
import { BareProps } from '@webb-dapp/ui-components/types';
import React, { FC, useState } from 'react';

import { ApiProvider } from './ApiProvider';
import { ExtensionProvider } from './ExtensionProvider';
import { SettingProvider } from './SettingProvider';
import { StoreProvier } from './store';
import { Chain, Wallet, WebbApiProvider, WebbContext } from '@webb-dapp/react-environment/webb-context';
import { chainsConfig } from '@webb-dapp/apps/configs/wallets/chain-config';
import { walletsConfig } from '@webb-dapp/apps/configs/wallets/wallets-config';

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
  const [activeApi, setActiveApi] = useState<WebbApiProvider | undefined>(undefined);

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
