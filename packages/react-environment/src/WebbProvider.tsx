import Icon from '@material-ui/core/Icon';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { beresheetStorage, mainStorage, rinkebyStorage } from '@webb-dapp/apps/configs/storages/evm-storage';
import { chainsPopulated } from '@webb-dapp/apps/configs/wallets/chains-populated';
import { walletsConfig, WalletsIds } from '@webb-dapp/apps/configs/wallets/wallets-config';
import { WebbError, WebbErrorCodes } from '@webb-dapp/react-components/InteractiveFeedbackView/InteractiveErrorView';
import { EVMStorage, WebbEVMChain, WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3';
import { DimensionsProvider } from '@webb-dapp/react-environment/layout';
import { StoreProvier } from '@webb-dapp/react-environment/store';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { BareProps } from '@webb-dapp/ui-components/types';
import { Storage } from '@webb-dapp/utils';
import { Account } from '@webb-dapp/wallet/account/Accounts.adapter';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { WebbPolkadot } from './api-providers/polkadot';
import { SettingProvider } from './SettingProvider';
import {
  Chain,
  FeedbackBody,
  InteractiveFeedback,
  netStorageFactory,
  NetworkStorage,
  Wallet,
  WebbApiProvider,
  WebbContext,
} from './webb-context';
import { MetaMaskLogo } from '@webb-dapp/apps/configs/wallets/logos/MetaMaskLogo';
import { Button, Typography } from '@material-ui/core';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import FireFoxLogo from '@webb-dapp/apps/configs/wallets/logos/FireFoxLogo';
import { PolkaLogo } from '@webb-dapp/apps/configs/wallets/logos/PolkaLogo';
import { detect } from 'detect-browser';
import ChromeLogo from '@webb-dapp/apps/configs/wallets/logos/ChromeLogo';

interface WebbProviderProps extends BareProps {
  applicationName: string;
  applicationVersion?: string;
}

const chains = chainsPopulated;

const registerInteractiveFeedback = (
  setter: (update: (p: InteractiveFeedback[]) => InteractiveFeedback[]) => any,
  interactiveFeedback: InteractiveFeedback
) => {
  let off: any;
  setter((p) => [...p, interactiveFeedback]);
  off = interactiveFeedback.on('canceled', () => {
    setter((p) => p.filter((entry) => entry !== interactiveFeedback));
    off && off?.();
  });
};
const getPlatformMetaData = () => {
  const browser = detect();
  const name = browser?.name;
  switch (name) {
    case 'firefox':
      return {
        name: 'firefox',
        logo: FireFoxLogo,
        storeName: 'FireFox Addons',
      };
    case 'chrome':
      return {
        name: 'chrome',
        logo: ChromeLogo,
        storeName: 'Chrome web store',
      };
    default:
      throw new Error('unsupported platform');
  }
};
export const WebbProvider: FC<WebbProviderProps> = ({ applicationName = 'Webb Dapp', children }) => {
  const [activeWallet, setActiveWallet] = useState<Wallet | undefined>(undefined);
  const [activeChain, setActiveChain] = useState<Chain | undefined>(undefined);
  const [activeApi, setActiveApi] = useState<WebbApiProvider<any> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [networkStorage, setNetworkStorage] = useState<NetworkStorage | null>(null);
  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [activeAccount, _setActiveAccount] = useState<Account | null>(null);
  const [isInit, setIsInit] = useState(true);

  const [interactiveFeedbacks, setInteractiveFeedbacks] = useState<InteractiveFeedback[]>([]);
  useEffect(() => {
    setInteractiveFeedbacks([]);
    const off = activeApi?.on('interactiveFeedback', (feedback) => {
      registerInteractiveFeedback(setInteractiveFeedbacks, feedback);
    });
    return () => {
      off && off();
      setInteractiveFeedbacks([]);
    };
  }, [activeApi]);

  const activeFeedback = useMemo(() => {
    if (interactiveFeedbacks.length === 0) {
      return null;
    }
    return interactiveFeedbacks[interactiveFeedbacks.length - 1];
  }, [interactiveFeedbacks]);

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
  const forceActiveApiUpdate = (activeApi: WebbApiProvider<any>) => {
    setActiveApi(undefined);
    setActiveApi(activeApi);
    interactiveFeedbacks.forEach((interactiveFeedback) => {
      if (interactiveFeedback.reason === WebbErrorCodes.UnsupportedChain) {
        interactiveFeedback.cancel();
      }
    });
  };
  const switchChain = async (chain: Chain, _wallet: Wallet) => {
    const wallet = _wallet || activeWallet;
    // wallet cleanup
    if (_wallet.id !== activeWallet?.id && activeApi) {
      await activeApi.destroy();
    }
    try {
      setActiveChain(chain);
      setActiveWallet(wallet);
      let activeApi: WebbApiProvider<any> | null = null;
      switch (wallet.id) {
        case WalletsIds.Polkadot:
          {
            const url = chain.url;
            const webbPolkadot = await WebbPolkadot.init('Webb DApp', [url], {
              onError: (feedback) => {
                registerInteractiveFeedback(setInteractiveFeedbacks, feedback);
              },
            });
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
            const chainId = await web3Provider.network; // storage based on network id
            const chainType = WebbWeb3Provider.storageName(chainId);
            // const rinkebyS = await Storage.newFresh(WebbEVMChain.Rinkeby, rinkebyStorage);
            // const mainS = await Storage.newFresh(WebbEVMChain.Main, mainStorage);
            // const beresheetS = await Storage.newFresh(WebbEVMChain.Beresheet, beresheetStorage);
            let storage: Storage<EVMStorage>;
            switch (chainId) {
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
            webbWeb3Provider.on('providerUpdate', async ([chainId]) => {
              const nextChain = Object.values(chains).find((chain) => chain.evmId === chainId);
              if (!nextChain) {
                try {
                  const name = WebbWeb3Provider.storageName(chainId);
                  notificationApi({
                    message: 'Web3: changed the connected network',
                    variant: 'info',
                    Icon: React.createElement(Icon, null, ['leak_add']),
                    secondaryMessage: `Connection is switched to ${name} chain`,
                  });
                  let storage: Storage<EVMStorage>;
                  switch (chainId) {
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
                  webbWeb3Provider.setStorage(storage);
                  setActiveChain(chain);
                  setActiveWallet(wallet);
                  forceActiveApiUpdate(webbWeb3Provider);
                } catch (e) {
                  setActiveChain(undefined);
                  setActiveWallet(wallet);
                  if (e instanceof WebbError) {
                    const errorMessage = e.errorMessage;
                    const code = errorMessage.code;
                    let feedbackBody: FeedbackBody = [];
                    let actions = InteractiveFeedback.actionsBuilder().actions();
                    let interactiveFeedback: InteractiveFeedback;
                    switch (code) {
                      case WebbErrorCodes.UnsupportedChain:
                        {
                          setActiveChain(undefined);
                          feedbackBody = InteractiveFeedback.feedbackEntries([
                            {
                              header: 'Switched to unsupported chain',
                            },
                            {
                              content: 'Please consider switching back to a supported chain',
                            },
                            {
                              list: [
                                WebbWeb3Provider.storageName(WebbEVMChain.Rinkeby),
                                WebbWeb3Provider.storageName(WebbEVMChain.Beresheet),
                                WebbWeb3Provider.storageName(WebbEVMChain.Main),
                              ],
                            },
                            {
                              content: 'Switch back via MetaMask',
                            },
                          ]);
                          actions = InteractiveFeedback.actionsBuilder()
                            .action(
                              'Ok',
                              () => {
                                interactiveFeedback?.cancel();
                              },
                              'success'
                            )
                            .actions();
                          interactiveFeedback = new InteractiveFeedback(
                            'error',
                            actions,
                            () => {
                              interactiveFeedback?.cancel();
                            },
                            feedbackBody,
                            WebbErrorCodes.UnsupportedChain
                          );
                          if (interactiveFeedback) {
                            registerInteractiveFeedback(setInteractiveFeedbacks, interactiveFeedback);
                          }
                        }
                        break;
                      case WebbErrorCodes.MixerSizeNotFound:
                        break;
                    }
                  }

                  // notificationApi({
                  //   message: 'Web3: Switched to unsupported chain',
                  //   variant: 'error',
                  //   Icon: React.createElement(Icon, null, ['error']),
                  //   secondaryMessage: `Connection is switched to ${name} chain`,
                  // });
                }
              } else {
                const name = WebbWeb3Provider.storageName(chainId);
                notificationApi({
                  message: 'Web3: changed the connected network',
                  variant: 'info',
                  Icon: React.createElement(Icon, null, ['leak_add']),
                  secondaryMessage: `Connection is switched to ${name} chain`,
                });
                let storage: Storage<EVMStorage>;
                switch (chainId) {
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
                webbWeb3Provider.setStorage(storage);
                setActiveChain(nextChain);
                setActiveWallet(wallet);
                forceActiveApiUpdate(webbWeb3Provider);
              }
            });
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
    } catch (e) {
      if (e instanceof WebbError) {
        const errorMessage = e.errorMessage;
        const code = errorMessage.code;
        let feedbackBody: FeedbackBody = [];
        let actions = InteractiveFeedback.actionsBuilder().actions();
        let interactiveFeedback: InteractiveFeedback;
        switch (code) {
          case WebbErrorCodes.UnsupportedChain:
            {
              setActiveChain(undefined);
              feedbackBody = InteractiveFeedback.feedbackEntries([
                {
                  header: 'Switched to unsupported chain',
                },
                {
                  content: 'Please consider switching back to a supported chain',
                },
                {
                  list: [
                    WebbWeb3Provider.storageName(WebbEVMChain.Rinkeby),
                    WebbWeb3Provider.storageName(WebbEVMChain.Beresheet),
                    WebbWeb3Provider.storageName(WebbEVMChain.Main),
                  ],
                },
                {
                  content: 'Switch back via MetaMask',
                },
              ]);
              actions = InteractiveFeedback.actionsBuilder()
                .action(
                  'Ok',
                  () => {
                    interactiveFeedback?.cancel();
                  },
                  'success'
                )
                .actions();
              interactiveFeedback = new InteractiveFeedback(
                'error',
                actions,
                () => {
                  interactiveFeedback?.cancel();
                },
                feedbackBody,
                WebbErrorCodes.UnsupportedChain
              );
              if (interactiveFeedback) {
                registerInteractiveFeedback(setInteractiveFeedbacks, interactiveFeedback);
              }
            }
            break;
          case WebbErrorCodes.MetaMaskExtensionNotInstalled:
            {
              const platform = getPlatformMetaData();
              setActiveChain(undefined);
              feedbackBody = InteractiveFeedback.feedbackEntries([
                {
                  header: `MetaMask extensions isn't installed`,
                },
                {
                  content: 'Please consider installing the browser extension for your browser',
                },
                {
                  any: () => {
                    return (
                      <Padding v={2} x={0}>
                        <div>
                          <Button
                            color='primary'
                            variant={'text'}
                            fullWidth
                            onClick={() => {
                              switch (platform.name) {
                                case 'firefox': {
                                  window.open(`https://addons.mozilla.org/firefox/addon/ether-metamask/`, '_blank');
                                }
                                case 'chrome': {
                                  window.open(
                                    `https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en`,
                                    '_blank'
                                  );
                                }
                              }
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                              }}
                            >
                              <MetaMaskLogo />
                            </div>
                            <Padding v x={0.5} />
                            <Typography>MetaMask official website</Typography>
                            <Padding v x={0.5} />
                            <Icon>open_in_new</Icon>
                          </Button>
                        </div>
                        <Padding v />
                        <div>
                          <Button color='primary' variant='contained' fullWidth>
                            <div
                              style={{
                                width: 30,
                                height: 30,
                              }}
                            >
                              <platform.logo />
                            </div>
                            <Padding x={0.5} />
                            <Typography>Get it from {platform.storeName} </Typography>
                            <Padding v={2} x={0.5} />
                            <Icon>get_app</Icon>
                          </Button>
                        </div>
                      </Padding>
                    );
                  },
                },
                {
                  content: 'Switch back via MetaMask',
                },
              ]);
              actions = InteractiveFeedback.actionsBuilder()
                .action(
                  'Ok',
                  () => {
                    interactiveFeedback?.cancel();
                  },
                  'success'
                )
                .actions();
              interactiveFeedback = new InteractiveFeedback(
                'error',
                actions,
                () => {
                  interactiveFeedback?.cancel();
                },
                feedbackBody,
                WebbErrorCodes.UnsupportedChain
              );
              if (interactiveFeedback) {
                registerInteractiveFeedback(setInteractiveFeedbacks, interactiveFeedback);
              }
            }
            break;
          case WebbErrorCodes.PolkaDotExtensionNotInstalled: {
            const platform = getPlatformMetaData();
            setActiveChain(undefined);
            feedbackBody = InteractiveFeedback.feedbackEntries([
              {
                header: `PolkaDot extensions isn't installed`,
              },
              {
                content: 'Please consider installing the browser extension for your browser',
              },
              {
                any: () => {
                  return (
                    <Padding v={2} x={0}>
                      <div>
                        <Button
                          color='primary'
                          variant={'text'}
                          fullWidth
                          onClick={() => {
                            window.open('https://polkadot.js.org/extension', '_blank');
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                            }}
                          >
                            <PolkaLogo />
                          </div>
                          <Padding v x={0.5} />
                          <Typography>Polkadot official website</Typography>
                          <Padding v x={0.5} />
                          <Icon>open_in_new</Icon>
                        </Button>
                      </div>
                      <Padding v />
                      <div>
                        <Button
                          onClick={() => {
                            switch (platform.name) {
                              case 'firefox': {
                                window.open(
                                  `https://addons.mozilla.org/firefox/addon/polkadot-js-extension/`,
                                  '_blank'
                                );
                              }
                              case 'chrome': {
                                window.open(
                                  `https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd`,
                                  '_blank'
                                );
                              }
                            }
                          }}
                          color='primary'
                          variant='contained'
                          fullWidth
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                            }}
                          >
                            <platform.logo />
                          </div>
                          <Padding x={0.5} />
                          <Typography>Get it from {platform.storeName} </Typography>
                          <Padding v={2} x={0.5} />
                          <Icon>get_app</Icon>
                        </Button>
                      </div>
                    </Padding>
                  );
                },
              },
              {
                content: 'Switch back via MetaMask',
              },
            ]);
            actions = InteractiveFeedback.actionsBuilder()
              .action(
                'Ok',
                () => {
                  interactiveFeedback?.cancel();
                },
                'success'
              )
              .actions();
            interactiveFeedback = new InteractiveFeedback(
              'error',
              actions,
              () => {
                interactiveFeedback?.cancel();
              },
              feedbackBody,
              WebbErrorCodes.UnsupportedChain
            );
            if (interactiveFeedback) {
              registerInteractiveFeedback(setInteractiveFeedbacks, interactiveFeedback);
            }
          }

          case WebbErrorCodes.MixerSizeNotFound:
            break;
        }
      }
      return null;
    }
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
      if (!net || !wallet) {
        return;
      }
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
        activeFeedback,
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
