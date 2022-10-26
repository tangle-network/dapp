import { Icon, Typography } from '@mui/material';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Account, Currency, NotificationPayload, WebbApiProvider } from '@nepoche/abstract-api-provider';
import { Bridge } from '@nepoche/abstract-api-provider/state';
import {
  keypairStorageFactory,
  netStorageFactory,
  NetworkStorage,
  noteStorageFactory,
} from '@nepoche/browser-utils/storage';
import {
  anchorsConfig,
  ApiConfig,
  bridgeConfigByAsset,
  Chain,
  chainsConfig,
  chainsPopulated,
  currenciesConfig,
  Wallet,
  walletsConfig,
} from '@nepoche/dapp-config';
import {
  BareProps,
  CurrencyRole,
  EVMChainId,
  InteractiveFeedback,
  WalletId,
  WebbError,
  WebbErrorCodes,
} from '@nepoche/dapp-types';
import { NoteManager } from '@nepoche/note-manager';
import { WebbPolkadot } from '@nepoche/polkadot-api-provider';
import { AppEvent, TAppEvent } from './app-event';
import { insufficientApiInterface } from './error/interactive-errors/insufficient-api-interface';
import { DimensionsProvider } from '@nepoche/responsive-utils';
import { StoreProvider } from '@nepoche/react-environment/store';
import { WebbContext } from './webb-context';
import { getRelayerManagerFactory } from '@nepoche/relayer-manager-factory';
import { notificationApi } from '@nepoche/ui-components/notification';
import { AccountSwitchNotification } from '@nepoche/ui-components/notification/AccountSwitchNotification';
import { Spinner } from '@nepoche/ui-components/Spinner/Spinner';
import { Web3Provider, Web3RelayerManager, WebbWeb3Provider } from '@nepoche/web3-api-provider';
import { LoggerService } from '@webb-tools/app-util';
import { calculateTypedChainId, ChainType, Keypair, Note } from '@webb-tools/sdk-core';
import { logger } from 'ethers';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { extensionNotInstalled, getWalletByWebbErrorCodes, unsupportedChain } from './error';
import { SettingProvider } from '@nepoche/react-environment';

interface WebbProviderProps extends BareProps {
  appEvent: TAppEvent;
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
  // eslint-disable-next-line prefer-const
  off = interactiveFeedback.on('canceled', () => {
    setter((p) => p.filter((entry) => entry !== interactiveFeedback));
    off && off?.();
  });
};

const apiConfig = ApiConfig.init({
  anchors: anchorsConfig,
  bridgeByAsset: bridgeConfigByAsset,
  chains: chainsConfig,
  currencies: currenciesConfig,
  wallets: walletsConfig,
});

function notificationHandler(notification: NotificationPayload) {
  switch (notification.name) {
    case 'Transaction': {
      const isFailed = notification.level === 'error';
      const isFinalized = notification.level === 'success';
      const description = notification.data ? (
        <div>
          {Object.keys(notification.data).map((i, idx) => (
            <Typography variant={'h6'} key={`${i}${idx}`}>
              {notification.data?.[i]}
            </Typography>
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

const appEvent = new AppEvent();

export const WebbProvider: FC<WebbProviderProps> = ({ applicationName = 'Webb Dapp', children }) => {
  const [activeWallet, setActiveWallet] = useState<Wallet | undefined>(undefined);
  const [activeChain, setActiveChain] = useState<Chain | undefined>(undefined);
  const [activeApi, setActiveApi] = useState<WebbApiProvider<any> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [networkStorage, setNetworkStorage] = useState<NetworkStorage | null>(null);
  const [noteManager, setNoteManager] = useState<NoteManager | null>(null);
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
    async (
      account: Account<any>,
      options: {
        networkStorage?: NetworkStorage | undefined | null;
        chain?: Chain | undefined;
        activeApi?: WebbApiProvider<any> | undefined;
      } = {}
    ) => {
      const innerNetworkStorage = options.networkStorage ?? networkStorage;
      const innerChain = options.chain ?? activeChain;
      const innerActiveApi = options.activeApi ?? activeApi;

      if (innerNetworkStorage && innerChain) {
        const typedChainId = calculateTypedChainId(innerChain.chainType, innerChain.chainId);

        const networksConfig = await innerNetworkStorage.get('networksConfig');
        innerNetworkStorage?.set('networksConfig', {
          ...networksConfig,
          [typedChainId]: {
            ...networksConfig[typedChainId],
            defaultAccount: account.address,
          },
        });
      }

      if (!innerActiveApi) {
        return;
      }

      _setActiveAccount(account);
      // TODO resolve the account inner type issue
      await innerActiveApi.accounts.setActiveAccount(account as any);
    },
    [activeApi, activeChain, networkStorage]
  );

  /// this will set the active api and the accounts
  const setActiveApiWithAccounts = async (
    nextActiveApi: WebbApiProvider<any> | undefined,
    chain: Chain,
    _networkStorage?: NetworkStorage | null
  ): Promise<void> => {
    if (nextActiveApi) {
      let hasSetFromStorage = false;
      const accounts = await nextActiveApi.accounts.accounts();

      const typedChainId = calculateTypedChainId(chain.chainType, chain.chainId);

      // TODO resolve the account inner type issue
      setAccounts(accounts as any);

      if (_networkStorage) {
        const networkDefaultConfig = await _networkStorage.get('networksConfig');
        let defaultAccount = networkDefaultConfig?.[typedChainId]?.defaultAccount;
        defaultAccount = defaultAccount ?? accounts[0]?.address;
        const defaultFromSettings = accounts.find((account) => account.address === defaultAccount);
        if (defaultFromSettings) {
          // TODO resolve the account inner type issue
          _setActiveAccount(defaultFromSettings as any);
          await nextActiveApi.accounts.setActiveAccount(defaultFromSettings);
          hasSetFromStorage = true;
        }
      }

      if (!hasSetFromStorage) {
        await setActiveAccount(accounts[0], { networkStorage: _networkStorage, chain, activeApi: nextActiveApi });
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
          const interactiveFeedback = unsupportedChain(apiConfig);
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
      case WebbErrorCodes.TalismanExtensionNotInstalled:
      case WebbErrorCodes.SubWalletExtensionNotInstalled:
        {
          const interactiveFeedback = extensionNotInstalled(getWalletByWebbErrorCodes(code));
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

  const loginNoteAccount = async (key: string): Promise<NoteManager> => {
    // Set the keypair
    const keypairStorage = await keypairStorageFactory();
    const accountKeypair = new Keypair(key);
    await keypairStorage.set('keypair', {
      keypair: key,
    });

    // create a NoteManager instance
    const noteStorage = await noteStorageFactory(accountKeypair);
    const noteManager = await NoteManager.initAndDecryptNotes(noteStorage, accountKeypair);

    // set the noteManager instance on the activeApi if it exists
    if (activeApi) {
      activeApi.noteManager = noteManager;
    }

    setNoteManager(noteManager);
    return noteManager;
  };

  const logoutNoteAccount = async () => {
    const keypairStorage = await keypairStorageFactory();
    keypairStorage.set('keypair', {
      keypair: null,
    });
    // clear the noteManager instance on the activeApi if it exists
    if (activeApi) {
      activeApi.noteManager = null;
    }
    setNoteManager(null);
  };

  const purgeNoteAccount = async () => {
    const keypairStorage = await keypairStorageFactory();
    const currentKeypairPrivateKey = await keypairStorage.get('keypair');

    if (!currentKeypairPrivateKey.keypair) {
      return;
    }

    const currentKeypair = new Keypair(currentKeypairPrivateKey.keypair);

    const noteStorage = await noteStorageFactory(currentKeypair);
    noteStorage.set('encryptedNotes', {});

    keypairStorage.set('keypair', {
      keypair: null,
    });

    // clear the noteManager instance on the activeApi if it exists
    if (activeApi) {
      activeApi.noteManager = null;
    }
    setNoteManager(null);
  };

  /// Network switcher
  const switchChain = async (chain: Chain, _wallet: Wallet, _networkStorage?: NetworkStorage | undefined) => {
    const relayerManagerFactory = await getRelayerManagerFactory();

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
        case WalletId.Talisman:
        case WalletId.SubWallet:
          {
            const relayerManager = await relayerManagerFactory.getRelayerManager('substrate');
            const url = chain.url;
            const typedChainId = calculateTypedChainId(chain.chainType, chain.chainId);
            const webbPolkadot = await WebbPolkadot.init(
              'Webb DApp',
              [url],
              {
                onError: (feedback: InteractiveFeedback) => {
                  registerInteractiveFeedback(setInteractiveFeedbacks, feedback);
                },
              },
              relayerManager,
              apiConfig,
              notificationHandler,
              () => new Worker(new URL('@nepoche/react-environment/arkworks-proving-manager.worker')),
              typedChainId,
              wallet
            );
            await setActiveApiWithAccounts(webbPolkadot, chain, _networkStorage ?? networkStorage);
            localActiveApi = webbPolkadot;
            if (noteManager) {
              localActiveApi.noteManager = noteManager;
            }
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

              web3Provider = await Web3Provider.fromWalletConnectProvider(provider);
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
                  [React.createElement(wallet.Logo, { key: `${wallet.id}logo` })]
                ),
              });
            }
            /// get the current active chain from metamask
            const chainId = await web3Provider.network; // storage based on network id

            const relayerManager = (await relayerManagerFactory.getRelayerManager('evm')) as Web3RelayerManager;

            const webbWeb3Provider = await WebbWeb3Provider.init(
              web3Provider,
              chainId,
              relayerManager,
              noteManager,
              apiConfig,
              notificationHandler,
              () => new Worker(new URL('@nepoche/react-environment/circom-proving-manager.worker', import.meta.url))
            );

            const providerUpdateHandler = async ([updatedChainId]: number[]) => {
              const nextChain = Object.values(chains).find((chain) => chain.chainId === updatedChainId);

              try {
                /// this will throw if the user switched to unsupported chain
                const name = apiConfig.getEVMChainName(updatedChainId);
                const newTypedChainId = calculateTypedChainId(ChainType.EVM, updatedChainId);
                /// Alerting that the provider has changed via the extension
                notificationApi({
                  message: 'Web3: Connected',
                  variant: 'info',
                  Icon: React.createElement(Icon, null, ['leak_add']),
                  secondaryMessage: `Connection is switched to ${name} chain`,
                });
                setActiveWallet(wallet);
                setActiveChain(nextChain ? nextChain : chain);

                const bridgeOptions: Record<number, Bridge> = {};

                // Set a reasonable default bridge and change available bridges based on the new chain
                let defaultBridge: Bridge | null = null;
                for (const bridgeConfig of Object.values(webbWeb3Provider.config.bridgeByAsset)) {
                  if (Object.keys(bridgeConfig.anchors).includes(newTypedChainId.toString())) {
                    // List the bridge as supported by the new chain
                    const bridgeCurrencyConfig = webbWeb3Provider.config.currencies[bridgeConfig.asset];
                    const bridgeCurrency = new Currency(bridgeCurrencyConfig);
                    if (bridgeCurrency.getRole() !== CurrencyRole.Governable) {
                      continue;
                    }
                    const bridgeTargets = bridgeConfig.anchors;
                    const supportedBridge = new Bridge(bridgeCurrency, bridgeTargets);
                    bridgeOptions[newTypedChainId] = supportedBridge;

                    // Set the first compatible bridge encountered.
                    if (!defaultBridge) {
                      defaultBridge = supportedBridge;
                    }
                  }
                }

                // set the available bridges of the new chain
                webbWeb3Provider.state.setBridgeOptions(bridgeOptions);
                webbWeb3Provider.state.activeBridge = defaultBridge;
              } catch (e) {
                /// set the chain to be undefined as this won't be usable
                // TODO mark the api as not ready
                setActiveChain(undefined);
                setActiveWallet(wallet);
                webbWeb3Provider.state.activeBridge = null;
                if (e instanceof WebbError) {
                  /// Catching the errors for the switcher from the event
                  catchWebbError(e);
                }
              }
            };

            webbWeb3Provider.on('providerUpdate', providerUpdateHandler);

            await webbWeb3Provider.setChainListener();
            await webbWeb3Provider.setAccountListener();
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
                      {
                        chainType: chain.chainType,
                        chainId: chain.chainId,
                      },
                      WalletId.WalletConnectV1,
                    ]);
                  } else {
                    appEvent.send('networkSwitched', [
                      {
                        chainType: chain.chainType,
                        chainId: chain.chainId,
                      },
                      WalletId.MetaMask,
                    ]);
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

            await setActiveApiWithAccounts(webbWeb3Provider, chain, _networkStorage ?? networkStorage);
            /// listen to `providerUpdate` by MetaMask
            localActiveApi = webbWeb3Provider;
            setLoading(false);
          }
          break;
      }
      /// settings the user selection
      setActiveChain(chain);
      setActiveWallet(wallet);
      setLoading(false);
      return localActiveApi;
    } catch (e) {
      if (e instanceof WebbError) {
        /// Catch the errors for the switcher while switching
        catchWebbError(e);
      }
      console.log(e);
      LoggerService.get('App').error(e);
      return null;
    }
  };

  /// a util will store the network/wallet config before switching
  const switchChainAndStore = async (chain: Chain, wallet: Wallet) => {
    setIsConnecting(true);

    try {
      const provider = await switchChain(chain, wallet);
      /** TODO: `networkStorage` can be `null` here.
       * Suggestion: use `useRef` instead of `useState`
       * for the `networkStorage` because state update asynchronous
       * */
      const _networkStorage = networkStorage ?? (await netStorageFactory());
      if (provider && _networkStorage) {
        await Promise.all([
          _networkStorage.set('defaultNetwork', calculateTypedChainId(chain.chainType, chain.chainId)),
          _networkStorage.set('defaultWallet', wallet.id),
        ]);
      }
      return provider;
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    /// init the dApp
    const init = async () => {
      setIsConnecting(true);
      const _networkStorage = await netStorageFactory();
      setNetworkStorage(_networkStorage);
      /// get the default wallet and network from storage
      const [net, wallet] = await Promise.all([
        _networkStorage.get('defaultNetwork'),
        _networkStorage.get('defaultWallet'),
      ]);

      // NoteManager configuration
      const keypairStorage = await keypairStorageFactory();
      const storedKeypair = await keypairStorage.get('keypair');
      let createdNoteManager: NoteManager | null = null;

      // Create the NoteManager if the stored keypair exists.
      if (storedKeypair?.keypair) {
        createdNoteManager = await loginNoteAccount(storedKeypair.keypair);
        setNoteManager(createdNoteManager);
      }

      /// if there's no chain, return
      if (!net || !wallet) {
        return;
      }

      /// chain config by net id
      const chainConfig = chains[net];

      // wallet config by chain
      const walletConfig = chainConfig.wallets[wallet] || Object.values(chainConfig)[0];
      const activeApi = await switchChain(chainConfig, walletConfig, _networkStorage);
      const networkDefaultConfig = await _networkStorage.get('networksConfig');

      if (activeApi) {
        if (!activeApi.noteManager) {
          activeApi.noteManager = createdNoteManager;
        }
        const accounts = await activeApi.accounts.accounts();
        let defaultAccount = networkDefaultConfig[net]?.defaultAccount;
        defaultAccount = defaultAccount ?? accounts[0]?.address;
        const defaultFromSettings = accounts.find((account) => account.address === defaultAccount);
        logger.info(`Default account from settings`, defaultFromSettings);
        if (defaultFromSettings) {
          _setActiveAccount(defaultFromSettings);
          await activeApi.accounts.setActiveAccount(defaultFromSettings);
          _networkStorage?.set('networksConfig', {
            ...networkDefaultConfig,
            [net]: {
              ...chainConfig,
              defaultAccount: defaultFromSettings.address,
            },
          });
        }
      } else {
        // If the user did not want to switch to the previously stored chain,
        // set the previosuly stored chain in the app for display only.
        setActiveChain(chains[net]);
      }
    };
    init().finally(() => {
      setIsConnecting(false);
    });
    appEvent.on('networkSwitched', async ([chain, wallet]) => {
      // Set the default network to the last selected network
      const networkStorage = await netStorageFactory();
      await Promise.all([
        networkStorage.set('defaultNetwork', chain.chainId),
        networkStorage.set('defaultWallet', wallet),
      ]);
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
        noteManager,
        loginNoteAccount,
        logoutNoteAccount,
        purgeNoteAccount,
        activeWallet,
        activeChain,
        activeApi,
        accounts,
        activeAccount,
        setActiveAccount,
        apiConfig,
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
      <StoreProvider>
        <SettingProvider>
          <DimensionsProvider>{children}</DimensionsProvider>
        </SettingProvider>
      </StoreProvider>
    </WebbContext.Provider>
  );
};
