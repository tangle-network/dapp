import { Typography } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import WalletConnectProvider from '@walletconnect/web3-provider';
import {
  anchorsConfig,
  bridgeConfigByAsset,
  chainsConfig,
  chainsPopulated,
  currenciesConfig,
  walletsConfig,
} from '@webb-dapp/apps/configs';
import { getWebbRelayer } from '@webb-dapp/apps/configs/relayer-config';
import { WalletId } from '@webb-dapp/apps/configs/wallets/wallet-id.enum';
import { appEvent } from '@webb-dapp/react-environment/app-event';
import { insufficientApiInterface } from '@webb-dapp/react-environment/error/interactive-errors/insufficient-api-interface';
import { DimensionsProvider } from '@webb-dapp/react-environment/layout';
import { StoreProvier } from '@webb-dapp/react-environment/store';
import { netStorageFactory, WebbContext } from '@webb-dapp/react-environment/webb-context';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { AccountSwitchNotification } from '@webb-dapp/ui-components/notification/AccountSwitchNotification';
import { Spinner } from '@webb-dapp/ui-components/Spinner/Spinner';
import { BareProps } from '@webb-dapp/ui-components/types';
import {
  Account,
  AppConfig,
  Chain,
  EVMChainId,
  evmIdIntoInternalChainId,
  getEVMChainName,
  InteractiveFeedback,
  InternalChainId,
  NetworkStorage,
  NotificationPayload,
  Wallet,
  WebbApiProvider,
  WebbError,
  WebbErrorCodes,
  WebbPolkadot,
  WebbWeb3Provider,
} from '@webb-tools/api-providers';
import { Web3Provider } from '@webb-tools/api-providers/ext-providers';
import { LoggerService } from '@webb-tools/app-util';
import { logger } from 'ethers';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { extensionNotInstalled, unsupportedChain } from './error';
import { SettingProvider } from './SettingProvider';

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
const appConfig: AppConfig = {
  anchors: anchorsConfig,
  bridgeByAsset: bridgeConfigByAsset,
  chains: chainsConfig,
  currencies: currenciesConfig,
  mixers: {},
  wallet: walletsConfig,
};

function notificationHandler(notification: NotificationPayload) {
  switch (notification.name) {
    case 'Transaction': {
      const isFailed = notification.level === 'error';
      const isFinalized = notification.level === 'success';
      const description = notification.data ? (
        <div>
          {Object.keys(notification.data).map((i) => (
            <Typography variant={'h6'}>{notification.data?.[i]}</Typography>
          ))}
        </div>
      ) : (
        notification.description
      );
      if (isFinalized) {
        const key = notificationApi({
          extras: {
            persist: false,
          },
          message: notification.message ?? 'Submit Transaction Success',
          secondaryMessage: description,
          key: notification.key,
          variant: 'success',
        });
        setTimeout(() => notificationApi.remove(notification.key), 6000);
        return key;
      } else if (isFailed) {
        return notificationApi({
          extras: {
            persist: false,
          },
          key: notification.key,
          message: notification.message,
          secondaryMessage: description,
          variant: 'error',
        });
      } else {
        return notificationApi({
          extras: {
            persist: true,
          },
          key: notification.key,
          message: notification.message,
          secondaryMessage: description,
          variant: 'info',
          // eslint-disable-next-line sort-keys
          Icon: <Spinner />,
          transparent: true,
        });
      }
    }
    default:
      return '';
  }
}

notificationHandler.remove = (key: string | number) => {
  notificationApi.remove(key);
};
export const WebbProvider: FC<WebbProviderProps> = ({ applicationName = 'Webb Dapp', children }) => {
  const [activeWallet, setActiveWallet] = useState<Wallet | undefined>(undefined);
  const [activeChain, setActiveChain] = useState<Chain | undefined>(undefined);
  const [activeApi, setActiveApi] = useState<WebbApiProvider<any> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [networkStorage, setNetworkStorage] = useState<NetworkStorage | null>(null);
  // TODO resolve the account inner type issue
  const [accounts, setAccounts] = useState<Array<Account | any>>([]);
  // TODO resolve the account inner type issue
  const [activeAccount, _setActiveAccount] = useState<Account | any | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  /// storing all interactive feedbacks to show the modals
  const [interactiveFeedbacks, setInteractiveFeedbacks] = useState<InteractiveFeedback[]>([]);
  /// An effect/hook will be called every time the active api is switched, it will cancel all the interactive feedbacks
  useEffect(() => {
    setInteractiveFeedbacks([]);
    const off = activeApi?.on('interactiveFeedback', (feedback) => {
      registerInteractiveFeedback(setInteractiveFeedbacks, feedback);
    });
    return () => {
      off && off();
      setInteractiveFeedbacks((p) => {
        p.forEach((p) => p.cancel());
        return [];
      });

      appEvent.send('changeNetworkSwitcherVisibility', false);
    };
  }, [activeApi]);

  /// the active feedback is the last one
  const activeFeedback = useMemo(() => {
    if (interactiveFeedbacks.length === 0) {
      return null;
    }
    return interactiveFeedbacks[interactiveFeedbacks.length - 1];
  }, [interactiveFeedbacks]);

  /// callback for setting active account
  /// it will store on the provider and the storage of the network
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

      if (!activeApi) {
        return;
      }
      _setActiveAccount(account);
      // TODO resolve the account inner type issue
      await activeApi.accounts.setActiveAccount(account as any);
    },
    [activeApi, networkStorage, activeChain]
  );

  /// Forcefully tell react to rerender the application with api change
  const forceActiveApiUpdate = (activeApi: WebbApiProvider<any>) => {
    setActiveApi(activeApi);
    interactiveFeedbacks.forEach((interactiveFeedback) => {
      if (interactiveFeedback.reason === WebbErrorCodes.UnsupportedChain) {
        interactiveFeedback.cancel();
      }
    });
  };

  /// this will set the active api and the accounts
  const setActiveApiWithAccounts = async (
    nextActiveApi: WebbApiProvider<any> | undefined,
    chainId: number
  ): Promise<void> => {
    if (nextActiveApi) {
      const accounts = await nextActiveApi.accounts.accounts();
      // TODO resolve the account inner type issue
      setAccounts(accounts as any);

      if (networkStorage) {
        const networkDefaultConfig = await networkStorage.get('networksConfig');
        let defaultAccount = networkDefaultConfig?.[chainId]?.defaultAccount;
        defaultAccount = defaultAccount ?? accounts[0]?.address;
        const defaultFromSettings = accounts.find((account) => account.address === defaultAccount);
        if (defaultFromSettings) {
          // TODO resolve the account inner type issue
          _setActiveAccount(defaultFromSettings as any);
          await nextActiveApi.accounts.setActiveAccount(defaultFromSettings);
        }
      } else {
        // await setActiveAccount(accounts[0]);
      }
      setActiveApi(nextActiveApi);
      nextActiveApi?.on('newAccounts', async (accounts) => {
        const acs = await accounts.accounts();
        const active = acs[0] || null;
        notificationApi({
          variant: 'info',
          Icon: (
            <div>
              <Icon>people-alt</Icon>
            </div>
          ),
          key: 'account-change',
          message: 'Account changed from provider',
          secondaryMessage: React.createElement(AccountSwitchNotification, {
            account: active?.address ?? 'UNKNOWN',
          }),
        });
        setAccounts(acs);
        _setActiveAccount(acs[0] || null);
      });
    } else {
      setActiveApi(nextActiveApi);
      setAccounts([]);
      _setActiveAccount(null);
    }
  };
  /// Error handler for the `WebbError`
  const catchWebbError = (e: WebbError) => {
    const errorMessage = e.errorMessage;
    const code = errorMessage.code;
    switch (code) {
      case WebbErrorCodes.UnsupportedChain:
        {
          setActiveChain(undefined);
          const interactiveFeedback = unsupportedChain(appConfig);
          if (interactiveFeedback) {
            registerInteractiveFeedback(setInteractiveFeedbacks, interactiveFeedback);
          }
        }
        break;
      case WebbErrorCodes.UnselectedChain:
        break;
      case WebbErrorCodes.MixerSizeNotFound:
        break;
      case WebbErrorCodes.MetaMaskExtensionNotInstalled:
      case WebbErrorCodes.PolkaDotExtensionNotInstalled:
        {
          const interactiveFeedback = extensionNotInstalled(
            code === WebbErrorCodes.PolkaDotExtensionNotInstalled ? 'polkadot' : 'metamask'
          );
          setActiveChain(undefined);
          registerInteractiveFeedback(setInteractiveFeedbacks, interactiveFeedback);
        }
        break;
      case WebbErrorCodes.InsufficientProviderInterface:
        {
          setActiveChain(undefined);
          const interactiveFeedback = insufficientApiInterface(appEvent);
          registerInteractiveFeedback(setInteractiveFeedbacks, interactiveFeedback);
        }
        break;
      case WebbErrorCodes.RelayerMisbehaving:
        break;
      default:
        alert(code);
    }
  };
  /// Network switcher
  const switchChain = async (chain: Chain, _wallet: Wallet) => {
    const relayer = await getWebbRelayer(appConfig);

    const wallet = _wallet || activeWallet;
    // wallet cleanup
    /// if new wallet id isn't the same of the current then the dApp is dealing with api change
    if (activeApi) {
      await activeApi.destroy();
    }
    try {
      setLoading(true);
      /// init the active api value
      let localActiveApi: WebbApiProvider<any> | null = null;
      switch (wallet.id) {
        case WalletId.Polkadot:
          {
            const url = chain.url;
            console.log('url: ', url);
            const webbPolkadot = await WebbPolkadot.init(
              'Webb DApp',
              [url],
              {
                onError: (feedback) => {
                  registerInteractiveFeedback(setInteractiveFeedbacks, feedback);
                },
              },
              relayer,
              appConfig,
              notificationHandler,
              () => new Worker(new URL('./proving-manager.worker', import.meta.url))
            );
            await setActiveApiWithAccounts(webbPolkadot, chain.id);
            localActiveApi = webbPolkadot;
            setLoading(false);
          }
          break;
        case WalletId.MetaMask:
        case WalletId.WalletConnectV1:
          {
            let web3Provider: Web3Provider;
            if (wallet?.id === WalletId.WalletConnectV1) {
              const provider = new WalletConnectProvider({
                rpc: {
                  //default on metamask
                  [EVMChainId.EthereumMainNet]: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                  [EVMChainId.Ropsten]: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                  [EVMChainId.Goerli]: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                  [EVMChainId.Kovan]: 'https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                  [EVMChainId.Rinkeby]: 'https://rinkeby.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4',
                  //default on metamask
                  [EVMChainId.Beresheet]: 'http://beresheet1.edgewa.re:9933',
                  [EVMChainId.HarmonyTestnet1]: 'https://api.s1.b.hmny.io',
                },
                chainId: chain.chainId,
              });

              web3Provider = await Web3Provider.fromWalletConnectProvider(provider as any);
            } else {
              /// init provider from the extension
              web3Provider = await Web3Provider.fromExtension();
            }

            const clientInfo = web3Provider.clientMeta;
            if (clientInfo) {
              notificationApi({
                message: 'Connected to EVM wallet',
                secondaryMessage: `Connected to ${clientInfo.name}`,
                variant: 'success',
                key: 'network-connect',
                Icon: React.createElement(
                  'div',
                  {
                    style: {
                      background: 'white',
                      minWidth: 30,
                      minHeight: 30,
                      padding: 4,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  },
                  [React.createElement(wallet.logo, { key: `${wallet.id}logo` })]
                ),
              });
            }
            /// get the current active chain from metamask
            const chainId = await web3Provider.network; // storage based on network id

            const webbWeb3Provider = await WebbWeb3Provider.init(
              web3Provider,
              chainId,
              relayer,
              appConfig,
              notificationHandler
            );

            const providerUpdateHandler = async ([chainId]: number[]) => {
              const nextChain = Object.values(chains).find((chain) => chain.chainId === chainId);
              try {
                /// this will throw if the user switched to unsupported chain
                const name = getEVMChainName(appConfig, chainId);
                /// Alerting that the provider has changed via the extension
                notificationApi({
                  message: 'Web3: changed the connected network',
                  variant: 'info',
                  Icon: React.createElement(Icon, null, ['leak_add']),
                  secondaryMessage: `Connection is switched to ${name} chain`,
                });
                webbWeb3Provider.setStorage(chainId);
                setActiveWallet(wallet);
                forceActiveApiUpdate(webbWeb3Provider);
                setActiveChain(nextChain ? nextChain : chain);
              } catch (e) {
                /// set the chain to be undefined as this won't be usable
                // TODO mark the api as not ready
                setActiveChain(undefined);
                setActiveWallet(wallet);
                if (e instanceof WebbError) {
                  /// Catching the errors for the switcher from the event
                  catchWebbError(e);
                }
              }
            };

            webbWeb3Provider.on('providerUpdate', providerUpdateHandler);

            webbWeb3Provider.setChainListener();
            const cantAddChain = !chain.chainId && !chain.evmRpcUrls;
            const addEvmChain = async () => {
              if (cantAddChain) {
                return;
              }

              // If we support the evmId but don't have an evmRpcUrl, then it is default on metamask
              await web3Provider
                .switchChain({
                  chainId: `0x${chain.chainId?.toString(16)}`,
                })
                ?.then(async () => {
                  if (web3Provider instanceof WalletConnectProvider) {
                    appEvent.send('networkSwitched', [
                      evmIdIntoInternalChainId(await chainId),
                      WalletId.WalletConnectV1,
                    ]);
                  } else {
                    appEvent.send('networkSwitched', [evmIdIntoInternalChainId(await chainId), WalletId.MetaMask]);
                  }
                })
                ?.catch(async (switchError) => {
                  console.log('inside catch for switchChain', switchError);

                  // cannot switch because network not recognized, so prompt to add it
                  if (switchError.code === 4902 && chain.chainId) {
                    const currency = currenciesConfig[chain.nativeCurrencyId];
                    await web3Provider.addChain({
                      chainId: `0x${chain.chainId.toString(16)}`,
                      chainName: chain.name,
                      rpcUrls: chain.evmRpcUrls ?? [],
                      nativeCurrency: {
                        decimals: 18,
                        name: currency.name,
                        symbol: currency.symbol,
                      },
                    });
                    // add network will prompt the switch, check evmId again and throw if user rejected
                    const newChainId = await web3Provider.network;

                    if (newChainId != chain.chainId) {
                      throw switchError;
                    }
                  } else {
                    throw switchError;
                  }
                });
            };
            if (chainId !== chain.chainId) {
              await addEvmChain();
            }

            await setActiveApiWithAccounts(webbWeb3Provider, chain.id);
            /// listen to `providerUpdate` by MetaMask
            localActiveApi = webbWeb3Provider;
          }
          break;
      }
      /// settings the user selection
      setActiveChain(chain);
      setActiveWallet(wallet);
      console.log('setActiveChain and setActiveWallet');
      setLoading(false);
      return localActiveApi;
    } catch (e) {
      if (e instanceof WebbError) {
        /// Catch the errors for the switcher while switching
        catchWebbError(e);
      }
      LoggerService.get('App').error(e);
      return null;
    }
  };
  /// a util will store the network/wallet config before switching
  const switchChainAndStore = async (chain: Chain, wallet: Wallet) => {
    const provider = await switchChain(chain, wallet);
    if (provider && networkStorage) {
      await Promise.all([
        networkStorage.set('defaultNetwork', chain.id),
        networkStorage.set('defaultWallet', wallet.id),
      ]);
    }
    return provider;
  };

  useEffect(() => {
    /// init the dApp
    const init = async () => {
      setIsConnecting(true);
      const networkStorage = await netStorageFactory();
      setNetworkStorage(networkStorage);
      /// get the default wallet and network from storage
      const [net, wallet] = await Promise.all([
        networkStorage.get('defaultNetwork'),
        networkStorage.get('defaultWallet'),
      ]);
      /// if there's no chain, set the default to Rinkeby and return
      if (!net || !wallet) {
        setActiveChain(chains[InternalChainId.Rinkeby]);
        return;
      }
      /// chain config by net id
      const chainConfig = chains[net];
      // wallet config by chain
      const walletConfig = chainConfig.wallets[wallet] || Object.values(chainConfig)[0];
      const activeApi = await switchChain(chainConfig, walletConfig);
      const networkDefaultConfig = await networkStorage.get('networksConfig');

      if (activeApi) {
        const accounts = await activeApi.accounts.accounts();
        let defaultAccount = networkDefaultConfig[chainConfig.id]?.defaultAccount;
        defaultAccount = defaultAccount ?? accounts[0]?.address;
        const defaultFromSettings = accounts.find((account) => account.address === defaultAccount);
        logger.info(`Default account from settings`, defaultFromSettings);
        if (defaultFromSettings) {
          _setActiveAccount(defaultFromSettings);
          await activeApi.accounts.setActiveAccount(defaultFromSettings);
          networkStorage?.set('networksConfig', {
            ...networkDefaultConfig,
            [chainConfig.id]: {
              ...chainConfig,
              defaultAccount: defaultFromSettings.address,
            },
          });
        }
      } else {
        // If the user did not want to switch to the previously stored chain,
        // set the previosuly stored chain in the app for display only.
        setActiveChain(chains[chainConfig.id]);
      }
    };
    init().finally(() => {
      setIsConnecting(false);
    });
    appEvent.on('networkSwitched', async ([chain, wallet]) => {
      const networkStorage = await netStorageFactory();
      await Promise.all([networkStorage.set('defaultNetwork', chain), networkStorage.set('defaultWallet', wallet)]);
    });
    appEvent.on('switchNetwork', ([chain, wallet]) => {
      switchChainAndStore(chain, wallet);
    });
    appEvent.on('setActiveAccount', (nextAccount) => {
      setActiveAccount(nextAccount);
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
        appConfig,
        switchChain: switchChainAndStore,
        isConnecting,
        async inactivateApi(): Promise<void> {
          setActiveApi(undefined);
          if (activeApi) {
            await activeApi.destroy();
          }
        },
        activeFeedback,
        registerInteractiveFeedback: (interactiveFeedback: InteractiveFeedback) => {
          registerInteractiveFeedback(setInteractiveFeedbacks, interactiveFeedback);
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
