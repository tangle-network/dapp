import { chainsConfig } from '@webb-dapp/apps/configs/wallets/chain-config';
import { walletsConfig } from '@webb-dapp/apps/configs/wallets/wallets-config';
import { DimensionsProvider } from '@webb-dapp/react-environment/layout';
import { StoreProvier } from '@webb-dapp/react-environment/store';
import { BareProps } from '@webb-dapp/ui-components/types';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { WebbPolkadot } from './api-providers/polkadot';
import { SettingProvider } from './SettingProvider';
import { Chain, Wallet, WebbApiProvider, WebbContext } from './webb-context';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';

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
  const [loading, setLoading] = useState(true);

  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [activeAccount, _setActiveAccount] = useState<Account | null>(null);
  const setActiveAccount = useCallback(
    async (account: Account<any>) => {
      if (!activeApi) return;
      _setActiveAccount(account);
      await activeApi.accounts.setActiveAccount(account);
    },
    [activeApi]
  );
  useEffect(() => {
    const activeEVM = true;
    if (activeEVM) {
      Web3Provider.fromExtension().then((web3Provider) => {
        WebbWeb3Provider.init(web3Provider).then(async (webbWeb3Provider) => {
          const accounts = await webbWeb3Provider.accounts.accounts();
          setAccounts(accounts);
          _setActiveAccount(accounts[0]);
          await webbWeb3Provider.accounts.setActiveAccount(accounts[0]);
          setActiveApi(webbWeb3Provider);
        });
      });
    } else {
      WebbPolkadot.init('Webb DApp', ['ws://127.0.0.1:9944']).then(async (provider) => {
        setActiveApi(provider);
        setLoading(false);
        const accounts = await provider.accounts.accounts();
        setAccounts(accounts);
        _setActiveAccount(accounts[0]);
        await provider.accounts.setActiveAccount(accounts[0]);
      });
    }
  }, []);
  return (
    <WebbContext.Provider
      value={{
        loading,
        wallets: walletsConfig,
        chains: chains,
        activeWallet,
        activeChain,
        activeApi,
        accounts,
        activeAccount,
        setActiveAccount,
        setActiveChain(id: number) {
          setActiveChain(chains[id]);
        },
        setActiveWallet(id: number) {
          setActiveWallet(walletsConfig[id]);
        },
      }}
    >
      <StoreProvier>
        <SettingProvider>
          <DimensionsProvider>{children}</DimensionsProvider>
        </SettingProvider>
      </StoreProvier>
    </WebbContext.Provider>
  );
};
