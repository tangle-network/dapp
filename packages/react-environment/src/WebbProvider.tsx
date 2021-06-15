import WalletConnectProvider from '@walletconnect/web3-provider';
import { mainStorage, rankebyStorage } from '@webb-dapp/apps/configs/storages/rinkeby-storage';
import { chainsConfig } from '@webb-dapp/apps/configs/wallets/chain-config';
import { walletsConfig, WalletsIds } from '@webb-dapp/apps/configs/wallets/wallets-config';
import { EVMStorage, WebbEVMChain, WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3';
import { DimensionsProvider } from '@webb-dapp/react-environment/layout';
import { StoreProvier } from '@webb-dapp/react-environment/store';
import { BareProps } from '@webb-dapp/ui-components/types';
import { Storage } from '@webb-dapp/utils';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import React, { FC, useCallback, useState } from 'react';

import { WebbPolkadot } from './api-providers/polkadot';
import { SettingProvider } from './SettingProvider';
import { Chain, Wallet, WebbApiProvider, WebbContext } from './webb-context';

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

  const switchChain = async (chain: Chain, wallet: Wallet) => {
    switch (wallet.id) {
      case WalletsIds.Polkadot:
        {
          const url = chain.url;
          const webbPolkadot = await WebbPolkadot.init('Webb DApp', [url]);
          setActiveApi(webbPolkadot);
          setLoading(false);
          const accounts = await webbPolkadot.accounts.accounts();
          setAccounts(accounts);
          _setActiveAccount(accounts[0]);
          await webbPolkadot.accounts.setActiveAccount(accounts[0]);
        }
        break;
      case WalletsIds.MetaMask:
        {
          const web3Provider = await Web3Provider.fromExtension();
          const net = await web3Provider.netowrk;
          const chainType = WebbWeb3Provider.chainType(net); //  use this to pick the storage
          const rainkybeS = await Storage.newFresh(WebbEVMChain.Rinkeby, rankebyStorage);
          const mainS = await Storage.newFresh(WebbEVMChain.Main, mainStorage);
          let storage: Storage<EVMStorage>;
          switch (chainType) {
            case WebbEVMChain.Main:
              storage = mainS;
              break;
            case WebbEVMChain.Rinkeby:
              storage = rainkybeS;
              break;
          }
          const webbWeb3Provider = await WebbWeb3Provider.init(web3Provider, rainkybeS);
          const accounts = await webbWeb3Provider.accounts.accounts();
          setAccounts(accounts);
          _setActiveAccount(accounts[0]);
          await webbWeb3Provider.accounts.setActiveAccount(accounts[0]);
          setActiveApi(webbWeb3Provider);
        }
        break;
      case WalletsIds.WalletConnect: {
        const provider = new WalletConnectProvider({
          rpc: {
            1: 'https://mainnet.mycustomnode.com',
            3: 'https://ropsten.mycustomnode.com',
            42: 'http://localhost:9933',
            // ...
          },
        });
        const web3Provider = await Web3Provider.fromWalletConnectProvider(provider);
        await web3Provider.eth.net.isListening();
        const net = await web3Provider.netowrk;
        const chainType = WebbWeb3Provider.chainType(net); //  use this to pick the storage
        const rainkybeS = await Storage.newFresh(WebbEVMChain.Rinkeby, rankebyStorage);
        const mainS = await Storage.newFresh(WebbEVMChain.Main, mainStorage);
        let storage: Storage<EVMStorage>;
        switch (chainType) {
          case WebbEVMChain.Main:
            storage = mainS;
            break;
          case WebbEVMChain.Rinkeby:
            storage = rainkybeS;
            break;
        }
        const webbWeb3Provider = await WebbWeb3Provider.init(web3Provider, rainkybeS);

        const accounts = await webbWeb3Provider.accounts.accounts();
        setAccounts(accounts);
        _setActiveAccount(accounts[0]);
        await webbWeb3Provider.accounts.setActiveAccount(accounts[0]);
        setActiveApi(webbWeb3Provider);
      }
    }
  };

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
        switchChain,
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
