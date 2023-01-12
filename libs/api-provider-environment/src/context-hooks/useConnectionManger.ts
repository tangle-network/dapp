import React, { useCallback, useEffect, useState } from 'react';
import {
  ApiConfig,
  Chain,
  chainsPopulated,
  Wallet,
} from '@webb-tools/dapp-config';
import {
  Account,
  Bridge,
  Currency,
  WebbApiProvider,
} from '@webb-tools/abstract-api-provider';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import { NetworkStorage } from '@webb-tools/browser-utils';
import { getRelayerManagerFactory } from '@webb-tools/relayer-manager-factory';
import {
  CurrencyRole,
  EVMChainId,
  InteractiveFeedback,
  WalletId,
  WebbError,
} from '@webb-tools/dapp-types';
import { WebbPolkadot } from '@webb-tools/polkadot-api-provider';
import {
  Web3Provider,
  Web3RelayerManager,
  WebbWeb3Provider,
} from '@webb-tools/web3-api-provider';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { notificationApi } from '@webb-tools/webb-ui-components';
import {
  NotificationHandier,
  RegisterInteractiveFeedback,
  RegisterInteractiveFeedbackSetter,
} from '../types';

export enum CurrentConnectionStatus {
  /**
   * The wallet is connected and the current active chain is both on the wallet and the DApp side
   * */
  Ideal,
  /**
   * The wallet connection is distributed by some reason
   * */
  Distributed,
  /**
   * The wallet is being changed to another wallet/network
   * */
  Switching,
}

export enum NextConnectionStatus {
  /**
   * Connection is being processed
   * */
  InProgress,
  /**
   * Connection has failed
   * */
  Failed,
}

type ConnectionStatus<Value, ConnectionStatus> = {
  /**
   * Connection value type
   * */
  connectionValue: Value;
  /**
   * Connection status
   * */
  status: ConnectionStatus;
  /**
   * Description message for the current status
   * */
  note?: string;
};
/**
 * Current connecting status and metadata
 * */
type CurrentConnection = ConnectionStatus<
  [Chain, Wallet],
  CurrentConnectionStatus
>;

/**
 * Next connecting status and metadata
 * */
type NextConnection = ConnectionStatus<[Chain, Wallet], NextConnectionStatus>;

type Maybe<T> = T | null;

function isSameChain(lh: Chain, rh: Chain): boolean {
  return (
    calculateTypedChainId(lh.chainType, lh.chainId) ===
    calculateTypedChainId(rh.chainType, rh.chainId)
  );
}
const chains = chainsPopulated;
interface WebbProviderState {
  activeApi: WebbApiProvider<any>;
  registerInteractiveFeedback: RegisterInteractiveFeedback;
  setInteractiveFeedbacks: RegisterInteractiveFeedbackSetter;
  apiConfig: ApiConfig;
  notificationHandler: NotificationHandier;
  networkStorage?: NetworkStorage | undefined;
}
export function useConnectionManger(providerState: WebbProviderState) {
  const {
    activeApi,
    registerInteractiveFeedback,
    setInteractiveFeedbacks,
    apiConfig,
    notificationHandler,
    networkStorage,
  } = providerState;
  const [currentConnection, setCurrentConnection] =
    useState<Maybe<CurrentConnection>>(null);
  const [nextConnection, setNextConnection] =
    useState<Maybe<NextConnection>>(null);
  const [activeAccount, setActiveAccount] = useState<Maybe<Account>>(null);
  /**
   *
   * Request a chain switch
   *
   * switching to the same chain, wallet (next or current ) won't add a switch request
   *
   * Change the value for the next network and do the required cleanup
   * 1. Cancel a MetaMask request for change
   * 2. Retry to connect in  network failure
   *
   *
   *
   * */
  const requestChainSwitch = useCallback(
    async (chain: Chain, wallet: Wallet) => {
      const nextConnectionValue = nextConnection?.connectionValue;
      const currentConnectionValue = currentConnection?.connectionValue;
      // There is switch request in progress
      if (
        nextConnectionValue &&
        isSameChain(chain, nextConnectionValue[0]) &&
        wallet.id === nextConnectionValue[1].id
      ) {
        if (nextConnection?.status === NextConnectionStatus.Failed) {
          // retry
        }
        return;
      }
      // The requested switch is already the current connection
      if (
        nextConnectionValue &&
        isSameChain(chain, nextConnectionValue[0]) &&
        wallet.id === nextConnectionValue[1].id
      ) {
        if (nextConnection?.status === NextConnectionStatus.Failed) {
          // retry
        }
        return;
      }
      setNextConnection({
        connectionValue: [chain, wallet],
        status: NextConnectionStatus.InProgress,
        note: undefined,
      });
    },
    [setNextConnection, setCurrentConnection, currentConnection, nextConnection]
  );

  useEffect(() => {
    const abortController = new AbortController();
    if (!nextConnection) {
      return;
    }
    const connectionStatus = nextConnection.status;

    if (connectionStatus && connectionStatus === NextConnectionStatus.Failed) {
      return;
    }
    const chain = nextConnection.connectionValue[0];
    const wallet = nextConnection.connectionValue[1];
    switchChain(
      chain,
      wallet,
      activeApi,
      registerInteractiveFeedback,
      setInteractiveFeedbacks,
      apiConfig,
      notificationHandler,
      networkStorage,
      abortController.signal
    )
      .then()
      .catch();
    return () => abortController.abort();
  }, [nextConnection, activeApi]);

  return {
    activeAccount,
    requestChainSwitch,
  };
}
const switchChain = async (
  chain: Chain,
  wallet: Wallet,
  activeApi: WebbApiProvider<any>,
  registerInteractiveFeedback: RegisterInteractiveFeedback,
  setInteractiveFeedbacks: RegisterInteractiveFeedbackSetter,
  apiConfig: ApiConfig,
  notificationHandler: NotificationHandier,
  networkStorage?: NetworkStorage | undefined,
  abortSignal: AbortSignal
) => {
  const relayerManagerFactory = await getRelayerManagerFactory();

  // wallet cleanup
  /// if new wallet id isn't the same of the current then the dApp is dealing with api change
  if (activeApi) {
    await activeApi.destroy();
  }

  try {
    /// init the active api value
    let localActiveApi: WebbApiProvider<any> | null = null;
    switch (wallet.id) {
      case WalletId.Polkadot:
      case WalletId.Talisman:
      case WalletId.SubWallet:
        {
          const relayerManager = await relayerManagerFactory.getRelayerManager(
            'substrate'
          );
          const url = chain.url;
          const typedChainId = calculateTypedChainId(
            chain.chainType,
            chain.chainId
          );
          const webbPolkadot = await WebbPolkadot.init(
            'Webb DApp',
            [url],
            {
              onError: (feedback: InteractiveFeedback) => {
                registerInteractiveFeedback(setInteractiveFeedbacks, feedback);
                // next connecting failed status
              },
            },
            relayerManager,
            apiConfig,
            notificationHandler,
            () =>
              new Worker(
                new URL(
                  '@webb-tools/react-environment/arkworks-proving-manager.worker'
                )
              ),
            typedChainId,
            wallet
          );
          // Get the default account from storage
          // If not set the active account as the first item in the list
          // Get the list of accounts
          // List on the Api for new account list

          localActiveApi = webbPolkadot;
          // Attach the note account API
          // Erase the next connection and set to null;
          // Set the current connection to be Ideal
        }
        break;

      case WalletId.MetaMask:
      case WalletId.WalletConnectV1:
        {
          let web3Provider: Web3Provider;
          if (wallet?.id === WalletId.WalletConnectV1) {
            // Get rpcs from evm chains
            const rpc = Object.values(chains).reduce((acc, chain) => {
              if (
                chain.chainType === ChainType.EVM &&
                chain.evmRpcUrls?.length
              ) {
                acc[chain.chainId] = chain.evmRpcUrls[0];
              }
              return acc;
            }, {} as Record<number, string>);

            const provider = new WalletConnectProvider({
              rpc: {
                ...rpc,

                //default on metamask
                [EVMChainId.HarmonyTestnet1]: 'https://api.s1.b.hmny.io',

                [EVMChainId.EthereumMainNet]:
                  'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
              },
              chainId: chain.chainId,
            });

            web3Provider = await Web3Provider.fromWalletConnectProvider(
              provider
            );
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
              Icon: React.cloneElement(wallet.Logo, { size: 'xl' }),
            });
          }
          /// get the current active chain from metamask
          const chainId = await web3Provider.network; // storage based on network id

          const relayerManager = (await relayerManagerFactory.getRelayerManager(
            'evm'
          )) as Web3RelayerManager;
          const noteManager = {} as any;
          const webbWeb3Provider = await WebbWeb3Provider.init(
            web3Provider,
            chainId,
            relayerManager,
            noteManager,
            apiConfig,
            notificationHandler,
            () =>
              new Worker(
                new URL(
                  '@webb-tools/react-environment/circom-proving-manager.worker',
                  import.meta.url
                )
              )
          );

          const providerUpdateHandler = async ([updatedChainId]: number[]) => {
            const nextChain = Object.values(chains).find(
              (chain) => chain.chainId === updatedChainId
            );

            try {
              /// this will throw if the user switched to unsupported chain
              const name = apiConfig.getEVMChainName(updatedChainId);
              const newTypedChainId = calculateTypedChainId(
                ChainType.EVM,
                updatedChainId
              );
              /// Alerting that the provider has changed via the extension
              notificationApi({
                message: 'Web3: Connected',
                variant: 'info',
                secondaryMessage: `Connection is switched to ${name} chain`,
              });

              const bridgeOptions: Record<number, Bridge> = {};

              // Set a reasonable default bridge and change available bridges based on the new chain
              let defaultBridge: Bridge | null = null;
              for (const bridgeConfig of Object.values(
                webbWeb3Provider.config.bridgeByAsset
              )) {
                if (
                  Object.keys(bridgeConfig.anchors).includes(
                    newTypedChainId.toString()
                  )
                ) {
                  // List the bridge as supported by the new chain
                  const bridgeCurrencyConfig =
                    webbWeb3Provider.config.currencies[bridgeConfig.asset];
                  const bridgeCurrency = new Currency(bridgeCurrencyConfig);
                  if (bridgeCurrency.getRole() !== CurrencyRole.Governable) {
                    continue;
                  }
                  const bridgeTargets = bridgeConfig.anchors;
                  const supportedBridge = new Bridge(
                    bridgeCurrency,
                    bridgeTargets
                  );
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
              webbWeb3Provider.state.activeBridge = null;
              if (e instanceof WebbError) {
                /// Catching the errors for the switcher from the event
              }
            }
          };

          webbWeb3Provider.on('providerUpdate', providerUpdateHandler);

          await webbWeb3Provider.setChainListener();
          await webbWeb3Provider.setAccountListener();
          // const _cantAddChain = !chain.chainId && !chain.evmRpcUrls;

          if (chainId !== chain.chainId) {
            // Add evmChain
          }
          // Get the default account from storage
          // If not set the active account as the first item in the list
          // Get the list of accounts
          // List on the Api for new account list

          // Attach the note account API
          // Erase the next connection and set to null;
          // Set the current connection to be Ideal
        }
        break;
    }
    return null;
  } catch (e) {
    return null;
  }
};
