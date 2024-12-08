'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type Account,
  type WebbApiProvider,
} from '@webb-tools/abstract-api-provider';
import { LoggerService } from '@webb-tools/browser-utils/logger';
import {
  netStorageFactory,
  type NetworkStorage,
} from '@webb-tools/browser-utils/storage';
import {
  ApiConfig,
  chainsConfig,
  chainsPopulated,
  walletsConfig,
  type Chain,
  type Wallet,
} from '@webb-tools/dapp-config';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import {
  WalletId,
  WebbError,
  WebbErrorCodes,
  type BareProps,
} from '@webb-tools/dapp-types';
import WalletNotInstalledError from '@webb-tools/dapp-types/errors/WalletNotInstalledError';
import type { Maybe, Nullable } from '@webb-tools/dapp-types/utils/types';
import { WebbPolkadot } from '@webb-tools/polkadot-api-provider';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/dapp-types/TypedChainId';
import {
  WebbWeb3Provider,
  isErrorInstance,
  isViemError,
} from '@webb-tools/web3-api-provider';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import useWagmiHydration from '@webb-tools/webb-ui-components/hooks/useWagmiHydration';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import {
  BaseError as WagmiBaseError,
  WagmiProvider,
  useConnect,
  type State as WagmiState,
} from 'wagmi';
import 'zustand/middleware';
import type { TAppEvent } from '../app-event';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useActiveChain } from '../hooks/useActiveChain';
import { useActiveWallet } from '../hooks/useActiveWallet';
import waitForConfigReady from '../utils/waitForConfigReady';
import { WebbContext } from '../webb-context';

interface WebbProviderInnerProps extends BareProps {
  appEvent: TAppEvent;
  applicationName: string;
  applicationVersion?: string;
}

const chains = chainsPopulated;
const logger = LoggerService.get('WebbProvider');

const apiConfig = ApiConfig.init({
  chains: chainsConfig,
  wallets: walletsConfig,
});

const appNetworkStoragePromise = netStorageFactory();

const WebbProviderInner: FC<WebbProviderInnerProps> = ({
  children,
  appEvent,
  applicationName,
}) => {
  const [activeWallet, setActiveWallet] = useActiveWallet();
  const [activeChain, setActiveChain] = useActiveChain();
  const [activeAccount, setActiveAccount] = useActiveAccount();

  const [activeApi, setActiveApi] = useState<Maybe<WebbApiProvider>>(undefined);

  const [loading, setLoading] = useState(false);

  const [accounts, setAccounts] = useState<Array<Account>>([]);

  const [isConnecting, setIsConnecting] = useState(false);

  const { notificationApi } = useWebbUI();

  const { connectAsync, connectors } = useConnect();

  const wagmiHydrated = useWagmiHydration();

  /**
   * Callback for setting active account
   * it will store on the provider and the storage of the network
   */
  const setActiveAccountWithStorage = useCallback(
    async (
      account: Account,
      options: {
        networkStorage?: NetworkStorage | undefined | null;
        chain?: Chain | undefined;
        activeApi?: Maybe<WebbApiProvider>;
      } = {},
    ) => {
      const innerNetworkStorage =
        options.networkStorage ?? (await appNetworkStoragePromise);
      const innerChain = options.chain ?? activeChain;
      const innerActiveApi = options.activeApi ?? activeApi;

      if (innerNetworkStorage && innerChain) {
        const typedChainId = calculateTypedChainId(
          innerChain.chainType,
          innerChain.id,
        );

        const networksConfig = await innerNetworkStorage.get('networksConfig');
        innerNetworkStorage?.set('networksConfig', {
          ...networksConfig,
          [typedChainId]: {
            ...networksConfig[typedChainId],
            defaultAccount: account.address,
          },
        });
      }

      if (innerActiveApi) {
        await innerActiveApi.accounts.setActiveAccount(account);
      }

      setActiveAccount(account);
    },
    [activeApi, activeChain, setActiveAccount],
  );

  /**
   * this will set the active api and the accounts
   */
  const setActiveApiWithAccounts = useCallback(
    async (
      nextActiveApi: WebbApiProvider | undefined,
      chain: Chain,
      _networkStorage?: NetworkStorage | null,
    ): Promise<void> => {
      if (!nextActiveApi) {
        setActiveApi(nextActiveApi);
        setAccounts([]);
        setActiveAccount(null);
        return;
      }

      let hasSetFromStorage = false;
      const accounts = await nextActiveApi.accounts.accounts();

      const typedChainId = calculateTypedChainId(chain.chainType, chain.id);

      setAccounts(accounts);

      if (_networkStorage) {
        const networkDefaultConfig =
          await _networkStorage.get('networksConfig');

        const defaultAccount =
          networkDefaultConfig?.[typedChainId]?.defaultAccount;
        const defaultFromSettings = accounts.find(
          (account) => account.address === defaultAccount,
        );

        if (defaultFromSettings) {
          setActiveAccount(defaultFromSettings);
          await nextActiveApi.accounts.setActiveAccount(defaultFromSettings);
          hasSetFromStorage = true;
        }
      }

      if (!hasSetFromStorage) {
        await setActiveAccountWithStorage(accounts[0], {
          networkStorage: _networkStorage,
          chain,
          activeApi: nextActiveApi,
        });
      }

      setActiveApi(nextActiveApi);
      nextActiveApi.on('newAccounts', async (accounts) => {
        const acs = await accounts.accounts();
        const active = acs[0];
        setAccounts(acs);

        if (!active) {
          return;
        }

        const networkStorage = _networkStorage ?? (await netStorageFactory());

        setActiveAccountWithStorage(active, {
          networkStorage,
          chain,
          activeApi: nextActiveApi,
        });
      });
    },
    [setActiveAccount, setActiveAccountWithStorage],
  );

  /**
   * Error handler for the `WebbError`
   */
  const catchWebbError = useCallback(
    (e: WebbError) => {
      const errorMessage = e.errorMessage;
      const code = errorMessage.code;
      switch (code) {
        case WebbErrorCodes.UnsupportedChain:
          {
            setActiveChain(undefined);
          }
          break;
        case WebbErrorCodes.UnselectedChain:
        case WebbErrorCodes.NoAccountAvailable:
          break;
        case WebbErrorCodes.MetaMaskExtensionNotInstalled:
        case WebbErrorCodes.RainbowExtensionNotInstalled:
        case WebbErrorCodes.PolkadotJSExtensionNotInstalled:
        case WebbErrorCodes.TalismanExtensionNotInstalled:
        case WebbErrorCodes.SubWalletExtensionNotInstalled:
          {
            // TODO: Implement interactive feedback with new components from webb-ui-components:
          }
          break;
        case WebbErrorCodes.InsufficientProviderInterface:
          {
            setActiveChain(undefined);
          }
          break;
        default:
          alert(code);
      }
    },
    [setActiveChain],
  );

  /**
   * Network switcher
   */
  const switchChain = useCallback(
    async (
      chain: Chain,
      wallet: Wallet,
      _networkStorage?: NetworkStorage | undefined,
      abortSignal?: AbortSignal,
    ) => {
      const nextTypedChainId = calculateTypedChainId(chain.chainType, chain.id);

      const sharedWalletConnectionPayload = {
        walletId: wallet.id,
        typedChainId: { chainId: chain.id, chainType: chain.chainType },
      };

      abortSignal?.throwIfAborted();

      // wallet cleanup
      // if new wallet id isn't the same of the current then the dApp is dealing with api change
      if (activeApi) {
        await activeApi.destroy();
      }

      try {
        setLoading(true);
        appEvent.send('walletConnectionState', {
          ...sharedWalletConnectionPayload,
          status: 'loading',
        });

        abortSignal?.throwIfAborted();

        const networkStorage =
          _networkStorage ?? (await appNetworkStoragePromise);

        /// init the active api value
        let localActiveApi: Nullable<WebbApiProvider> = null;

        abortSignal?.throwIfAborted();

        switch (wallet.id) {
          case WalletId.Polkadot:
          case WalletId.Talisman:
          case WalletId.SubWallet:
            {
              abortSignal?.throwIfAborted();

              const webSocketUrls = chain.rpcUrls.default.webSocket;
              if (!webSocketUrls || webSocketUrls.length === 0) {
                throw new Error(
                  `No websocket urls found for chain ${chain.name}`,
                );
              }

              abortSignal?.throwIfAborted();

              const webbPolkadot = await WebbPolkadot.init(
                applicationName,
                Array.from(webSocketUrls),
                apiConfig,
                nextTypedChainId,
                wallet,
              );

              abortSignal?.throwIfAborted();

              await setActiveApiWithAccounts(
                webbPolkadot,
                chain,
                _networkStorage ?? (await appNetworkStoragePromise),
              );

              localActiveApi = webbPolkadot;

              appEvent.send('walletConnectionState', {
                ...sharedWalletConnectionPayload,
                status: 'sucess',
              });
            }
            break;

          case WalletId.MetaMask:
          case WalletId.WalletConnectV2:
          case WalletId.Rainbow:
            {
              abortSignal?.throwIfAborted();
              const connector = connectors.find((c) => c.id === wallet.rdns);
              if (!connector) {
                throw new WalletNotInstalledError(wallet.id);
              }

              abortSignal?.throwIfAborted();

              const config = getWagmiConfig();

              await waitForConfigReady(config);

              if (config.state.current !== connector.uid) {
                await connectAsync({
                  chainId: chain.id,
                  connector: connector,
                });
              }

              abortSignal?.throwIfAborted();

              abortSignal?.throwIfAborted();

              const webbWeb3Provider = await WebbWeb3Provider.init(
                connector,
                chain.id,
                apiConfig,
              );

              const providerUpdateHandler = async ([
                updatedChainId,
              ]: number[]) => {
                const nextChain = Object.values(chains).find(
                  (chain) =>
                    chain.id === updatedChainId &&
                    chain.chainType === ChainType.EVM,
                );
                const activeChain = nextChain ? nextChain : chain;

                try {
                  /// this will throw if the user switched to unsupported chain
                  const name = apiConfig.getEVMChainName(updatedChainId);
                  const newTypedChainId = calculateTypedChainId(
                    ChainType.EVM,
                    updatedChainId,
                  );

                  /// update the current typed chain id
                  webbWeb3Provider.typedChainidSubject.next(newTypedChainId);

                  /// Alerting that the provider has changed via the extension
                  notificationApi({
                    message: 'Web3: Connected',
                    variant: 'info',
                    secondaryMessage: `Connection is switched to ${name} chain`,
                  });
                  setActiveWallet(wallet);
                  setActiveChain(activeChain);

                  appEvent.send('networkSwitched', [
                    {
                      chainType: activeChain.chainType,
                      chainId: activeChain.id,
                    },
                    wallet.id,
                  ]);
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

              abortSignal?.throwIfAborted();

              // Listen for chain updates when user switches chains in the extension
              webbWeb3Provider.on('providerUpdate', providerUpdateHandler);

              webbWeb3Provider.setChainListener();
              webbWeb3Provider.setAccountListener();

              abortSignal?.throwIfAborted();

              // Get the new chain id after the initialization of webb provider
              const currentChainId = await webbWeb3Provider.getChainId();

              if (currentChainId !== chain.id) {
                await webbWeb3Provider.switchOrAddChain(chain.id);
              }

              // Emit events
              appEvent.send('networkSwitched', [
                {
                  chainType: chain.chainType,
                  chainId: chain.id,
                },
                wallet.id,
              ]);

              abortSignal?.throwIfAborted();

              await setActiveApiWithAccounts(
                webbWeb3Provider,
                chain,
                _networkStorage ?? networkStorage,
              );
              /// listen to `providerUpdate` by MetaMask
              localActiveApi = webbWeb3Provider;
            }
            break;
        }

        abortSignal?.throwIfAborted();

        /// settings the user selection
        setActiveChain(chain);
        setActiveWallet(wallet);
        setLoading(false);
        appEvent.send('walletConnectionState', {
          ...sharedWalletConnectionPayload,
          status: 'sucess',
        });

        return localActiveApi;
      } catch (e) {
        setLoading(false);

        // Check if the error is an AbortError,
        // if so, just throw it to the caller.
        if ((e as Error).name === 'AbortError') {
          throw e;
        }

        logger.error(e);

        // Useful for debugging.
        console.debug(e);

        let err: WebbError | undefined = undefined;

        if (e instanceof WebbError) {
          /// Catch the errors for the switcher while switching
          catchWebbError(e);
          err = e;
        } else {
          // Parse and display error
          let errorMessage = WebbError.getErrorMessage(
            WebbErrorCodes.SwitchChainFailed,
          ).message;

          // Libraries error check
          if (isViemError(e) || isErrorInstance(e, WagmiBaseError)) {
            errorMessage = e.shortMessage;
          } else if (e instanceof Error) {
            errorMessage = e.message;
          }

          notificationApi({
            variant: 'error',
            message: 'Web3: Switch Chain Error',
            secondaryMessage: errorMessage,
          });
        }

        appEvent.send('walletConnectionState', {
          ...sharedWalletConnectionPayload,
          status: 'failed',
          error: err,
        });

        return null;
      }
    },
    // prettier-ignore
    [activeApi, appEvent, applicationName, catchWebbError, connectAsync, connectors, notificationApi, setActiveApiWithAccounts, setActiveChain, setActiveWallet],
  );

  /**
   * A util will store the network/wallet config before switching
   */
  const switchChainAndStore = useCallback(
    async (chain: Chain, wallet: Wallet) => {
      setIsConnecting(true);

      try {
        const provider = await switchChain(chain, wallet);
        /** TODO: `networkStorage` can be `null` here.
         * Suggestion: use `useRef` instead of `useState`
         * for the `networkStorage` because state update asynchronous
         * */
        const _networkStorage = await appNetworkStoragePromise;
        if (provider && _networkStorage) {
          await Promise.all([
            _networkStorage.set(
              'defaultNetwork',
              calculateTypedChainId(chain.chainType, chain.id),
            ),
            _networkStorage.set('defaultWallet', wallet.id),
          ]);
        }
        return provider;
      } finally {
        setIsConnecting(false);
      }
    },
    [switchChain],
  );

  const initFnStatus = useRef({
    calling: false,
    success: false,
    failed: false,
  });

  useEffect(
    () => {
      if (
        initFnStatus.current.calling ||
        initFnStatus.current.success ||
        !wagmiHydrated
      ) {
        return;
      }

      const abortController = new AbortController();

      // init the dApp
      const init = async () => {
        setIsConnecting(true);
        const _networkStorage = await appNetworkStoragePromise;
        /// get the default wallet and network from storage
        const [net, wallet] = await Promise.all([
          _networkStorage.get('defaultNetwork'),
          _networkStorage.get('defaultWallet'),
        ]);

        // if there's no chain, return
        if (!net || !wallet) {
          return;
        }

        // chain config by net id
        const chainConfig = chains[net];
        if (!chainConfig) {
          return;
        }

        let walletCfg: Wallet;

        // wallet config by chain
        if (Array.isArray(chainConfig.wallets)) {
          if (!chainConfig.wallets.length) {
            return;
          }

          // The new API with array of wallet ids
          if (chainConfig.wallets.includes(wallet)) {
            walletCfg = apiConfig.wallets[wallet];
          } else {
            walletCfg = apiConfig.wallets[chainConfig.wallets[0]];
          }
        } else {
          // The old API with Record of wallet ids and wallet configs
          walletCfg =
            chainConfig.wallets[wallet] || Object.values(chainConfig)[0];
        }

        // If the signal is aborted, do not proceed.
        abortController.signal.throwIfAborted();
        const activeApi = await switchChain(
          chainConfig,
          walletCfg,
          _networkStorage,
          abortController.signal,
        );

        const networkDefaultConfig =
          await _networkStorage.get('networksConfig');

        if (activeApi) {
          const accounts = await activeApi.accounts.accounts();
          let defaultAccount = networkDefaultConfig[net]?.defaultAccount;
          defaultAccount = defaultAccount ?? accounts[0]?.address;

          const defaultFromSettings = accounts.find(
            (account) => account.address === defaultAccount,
          );
          logger.info(`Default account from settings`, defaultFromSettings);

          if (defaultFromSettings) {
            setActiveAccountWithStorage(defaultFromSettings, {
              networkStorage: _networkStorage,
              chain: chainConfig,
              activeApi,
            });
          }
        } else {
          // If the user did not want to switch to the previously stored chain,
          // set the previosuly stored chain in the app for display only.
          setActiveChain(chains[net]);
        }
      };

      init()
        .then(() => {
          initFnStatus.current = {
            failed: false,
            calling: false,
            success: true,
          };
        })
        .catch((error) => {
          initFnStatus.current = {
            failed: true,
            calling: false,
            success: false,
          };
          // If the error is an AbortError, ignore it.
          if (error.name === 'AbortError') {
            return;
          }

          logger.error(error);
        })
        .finally(() => {
          setIsConnecting(false);
        });

      initFnStatus.current = {
        ...initFnStatus.current,
        calling: true,
      };

      return () => {
        abortController.abort();
      };
    },
    // prettier-ignore
    [setActiveAccountWithStorage, setActiveChain, switchChain, wagmiHydrated],
  );

  // App event listeners
  useEffect(() => {
    appEvent.on('networkSwitched', async ([chain, wallet]) => {
      // Set the default network to the last selected network
      const networkStorage = await netStorageFactory();
      await Promise.all([
        networkStorage.set(
          'defaultNetwork',
          calculateTypedChainId(chain.chainType, chain.chainId),
        ),
        networkStorage.set('defaultWallet', wallet),
      ]);
    });

    appEvent.on('switchNetwork', ([chain, wallet]) => {
      switchChainAndStore(chain, wallet);
    });

    appEvent.on('setActiveAccount', (nextAccount) => {
      setActiveAccountWithStorage(nextAccount);
    });
  }, [appEvent, setActiveAccountWithStorage, switchChainAndStore]);

  return (
    <WebbContext.Provider
      value={{
        appName: applicationName,
        loading,
        wallets: walletsConfig,
        chains: chains,
        activeWallet,
        activeChain,
        activeApi,
        accounts,
        activeAccount,
        setActiveAccount: setActiveAccountWithStorage,
        apiConfig,
        switchChain: switchChainAndStore,
        isConnecting,
        async inactivateApi(): Promise<void> {
          setAccounts([]);
          setActiveAccount(null);
          setActiveWallet(undefined);
          setActiveChain(activeChain);

          // remove app config from local storage
          const _networkStorage = await appNetworkStoragePromise;
          if (_networkStorage) {
            await Promise.all([
              _networkStorage.set('defaultNetwork', undefined),
              _networkStorage.set('defaultWallet', undefined),
              _networkStorage.set('networksConfig', {}),
            ]);

            if (activeApi) {
              await activeApi.destroy();
              setActiveApi(undefined);
            }
          }
        },
        appEvent,
      }}
    >
      {children}
    </WebbContext.Provider>
  );
};

const queryClient = new QueryClient();

interface WebbProviderProps extends WebbProviderInnerProps {
  isSSR?: boolean;
  wagmiInitialState?: WagmiState;
}

export const WebbProvider: FC<WebbProviderProps> = ({
  isSSR,
  wagmiInitialState,
  ...innerProps
}) => {
  return (
    <WagmiProvider
      config={getWagmiConfig({ isSSR })}
      initialState={wagmiInitialState}
    >
      <QueryClientProvider client={queryClient}>
        <WebbProviderInner {...innerProps} />
      </QueryClientProvider>
    </WagmiProvider>
  );
};
