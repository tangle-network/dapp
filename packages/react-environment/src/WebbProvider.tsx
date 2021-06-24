import WalletConnectProvider from '@walletconnect/web3-provider';
import { beresheetStorage, mainStorage, rinkebyStorage } from '@webb-dapp/apps/configs/storages/evm-storage';
import { chainsConfig } from '@webb-dapp/apps/configs/wallets/chain-config';
import { walletsConfig, WalletsIds } from '@webb-dapp/apps/configs/wallets/wallets-config';
import { EVMStorage, WebbEVMChain, WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3';
import { DimensionsProvider } from '@webb-dapp/react-environment/layout';
import { StoreProvier } from '@webb-dapp/react-environment/store';
import { BareProps } from '@webb-dapp/ui-components/types';
import { Storage } from '@webb-dapp/utils';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { WebbPolkadot } from './api-providers/polkadot';
import { SettingProvider } from './SettingProvider';
import { Chain, netStorageFactory, NetworkStorage, Wallet, WebbApiProvider, WebbContext } from './webb-context';
import { chainsPopulated } from '@webb-dapp/apps/configs/wallets/chains-populated';

interface WebbProviderProps extends BareProps {
  applicationName: string;
  applicationVersion?: string;
}

const chains = chainsPopulated;

export const WebbProvider: FC<WebbProviderProps> = ({ applicationName = 'Webb Dapp', children }) => {
  const [activeWallet, setActiveWallet] = useState<Wallet | undefined>(undefined);
  const [activeChain, setActiveChain] = useState<Chain | undefined>(undefined);
  const [activeApi, setActiveApi] = useState<WebbApiProvider<any> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [networkStorage, setNetworkStorage] = useState<NetworkStorage | null>(null);
  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [activeAccount, _setActiveAccount] = useState<Account | null>(null);
  const [isInit, setIsInit] = useState(true);
  const setActiveAccount = useCallback(
    async (account: Account<any>) => {
      if (networkStorage && activeChain) {
        const networksConfig = await networkStorage.get('networksConfig');
        networkStorage?.set('networksConfig', {
          ...networksConfig,
          [activeChain.id]: {
            ...networksConfig[activeChain.id],
            defaultAccount: account.address,
          },
        });
      }

      if (!activeApi) return;
      _setActiveAccount(account);
      await activeApi.accounts.setActiveAccount(account);
    },
    [activeApi, networkStorage, activeChain]
  );

  const switchChain = async (chain: Chain, wallet: Wallet) => {
    let activeApi: WebbApiProvider<any> | null = null;
    switch (wallet.id) {
      case WalletsIds.Polkadot:
        {
          const url = chain.url;
          const webbPolkadot = await WebbPolkadot.init('Webb DApp', [url]);
          setActiveApi(webbPolkadot);
          activeApi = webbPolkadot;
          setLoading(false);
          const accounts = await webbPolkadot.accounts.accounts();
          setAccounts(accounts);
          await setActiveAccount(accounts[0]);
          await webbPolkadot.accounts.setActiveAccount(accounts[0]);
        }
        break;
      case WalletsIds.MetaMask:
        {
          const web3Provider = await Web3Provider.fromExtension();
          const net = await web3Provider.network; // storage based on network id
          const chainType = WebbWeb3Provider.storageName(net);
          // const rinkebyS = await Storage.newFresh(WebbEVMChain.Rinkeby, rinkebyStorage);
          // const mainS = await Storage.newFresh(WebbEVMChain.Main, mainStorage);
          // const beresheetS = await Storage.newFresh(WebbEVMChain.Beresheet, beresheetStorage);
          let storage: Storage<EVMStorage>;
          switch (net) {
            case WebbEVMChain.Main:
              storage = await Storage.newFresh(chainType, mainStorage);
              break;
            case WebbEVMChain.Rinkeby:
              storage = await Storage.newFresh(chainType, rinkebyStorage);
              break;
            case WebbEVMChain.Beresheet:
              storage = await Storage.newFresh(chainType, beresheetStorage);
              break;
            default:
              storage = await Storage.newFresh(chainType, beresheetStorage);
              break;
          }
          const webbWeb3Provider = await WebbWeb3Provider.init(web3Provider, storage);
          const accounts = await webbWeb3Provider.accounts.accounts();
          setAccounts(accounts);
          await setActiveAccount(accounts[0]);
          await webbWeb3Provider.accounts.setActiveAccount(accounts[0]);
          setActiveApi(webbWeb3Provider);
          activeApi = webbWeb3Provider;
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
        const net = await web3Provider.network; // storage based on network id
        const chainType = WebbWeb3Provider.storageName(net);
        let storage: Storage<EVMStorage>;
        switch (net) {
          case WebbEVMChain.Main:
            storage = await Storage.newFresh(chainType, mainStorage);
            break;
          case WebbEVMChain.Rinkeby:
            storage = await Storage.newFresh(chainType, rinkebyStorage);
            break;
          case WebbEVMChain.Beresheet:
            storage = await Storage.newFresh(chainType, beresheetStorage);
            break;
          default:
            storage = await Storage.newFresh(chainType, beresheetStorage);
            break;
        }
        const webbWeb3Provider = await WebbWeb3Provider.init(web3Provider, storage);

        const accounts = await webbWeb3Provider.accounts.accounts();
        setAccounts(accounts);
        _setActiveAccount(accounts[0]);
        await webbWeb3Provider.accounts.setActiveAccount(accounts[0]);
        setActiveApi(webbWeb3Provider);
        activeApi = webbWeb3Provider;
      }
    }
    setActiveWallet(wallet);
    setActiveChain(chain);
    return activeApi;
  };

  const switchChainAndStore = async (chain: Chain, wallet: Wallet) => {
    if (networkStorage) {
      await Promise.all([
        networkStorage.set('defaultNetwork', chain.id),
        networkStorage.set('defaultWallet', wallet.id),
      ]);
    }
    return switchChain(chain, wallet);
  };
  useEffect(() => {
    const init = async () => {
      const networkStorage = await netStorageFactory();
      setNetworkStorage(networkStorage);
      const [net, wallet] = await Promise.all([
        networkStorage.get('defaultNetwork'),
        networkStorage.get('defaultWallet'),
      ]);
      const chainConfig = chains[net];
      const walletConfig = chainConfig.wallets[wallet] || Object.values(chainConfig)[0];
      const activeApi = await switchChain(chainConfig, walletConfig);
      const networkDefaultConfig = await networkStorage.get('networksConfig');
      if (activeApi) {
        const accounts = await activeApi.accounts.accounts();
        let defaultAccount = networkDefaultConfig[chainConfig.id]?.defaultAccount;
        defaultAccount = defaultAccount ?? accounts[0]?.address;
        const defaultFromSettings = accounts.find((account) => account.address === defaultAccount);
        if (defaultFromSettings) {
          _setActiveAccount(defaultFromSettings);
          await activeApi.accounts.setActiveAccount(defaultFromSettings);
        }
      }
    };
    init().finally(() => {
      setIsInit(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        switchChain: switchChainAndStore,
        isInit,
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
