// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-ts-comment */
import '@webb-tools/protocol-substrate-types';

import { ApiInitHandler } from '@webb-tools/abstract-api-provider';
import { Wallet } from '@webb-tools/dapp-config';
import {
  WalletId,
  InteractiveFeedback,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import { options as apiOptions } from '@webb-tools/api';
import { EventBus } from '@webb-tools/app-util';
import lodash from 'lodash';

import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  InjectedExtension,
  MetadataDef,
} from '@polkadot/extension-inject/types';

import { PolkaTXBuilder } from '../transaction';
import { isValidAddress } from './is-valid-address';
import { PolkadotAccount, PolkadotAccounts } from './polkadot-accounts';
import { LoggerService } from '@webb-tools/browser-utils';

const { isNumber } = lodash;

type ExtensionProviderEvents = {
  connected: undefined;
  disconnected: undefined;
  error: undefined;
  ready: undefined;

  updateMetaData: Record<string, unknown>;

  accountsChange: PolkadotAccount[];
};

const logger = LoggerService.get('Polkadot-Provider');

/**
 * Polkadot provider
 **/
export class PolkadotProvider extends EventBus<ExtensionProviderEvents> {
  private _accounts: PolkadotAccounts;

  constructor(
    protected apiPromise: ApiPromise,
    protected injectedExtension: InjectedExtension,
    readonly txBuilder: PolkaTXBuilder
  ) {
    super();
    this.hookListeners();
    this._accounts = new PolkadotAccounts(this.injectedExtension);
  }

  /**
   * Create a provider from browser extension
   * @param appName - Name of the application
   * @param endPoints - URLs for the substrate node
   * @param apiInitHandler - Error handler for stage of instantiating a provider
   * @param txBuilder - Transaction builder
   * @param wallet - Wallet to connect
   **/
  static async fromExtension(
    appName: string,
    endPoints: string[],
    apiInitHandler: ApiInitHandler,
    txBuilder: PolkaTXBuilder,
    wallet: Wallet
  ): Promise<PolkadotProvider> {
    const [endPoint, ...allEndPoints] = endPoints;
    const [apiPromise, currentExtensions] = await PolkadotProvider.getParams(
      appName,
      [endPoint, ...allEndPoints],
      apiInitHandler.onError,
      wallet
    );

    return new PolkadotProvider(apiPromise, currentExtensions, txBuilder);
  }

  /**
   * Get the api Promise
   * @param appName - Name of the application
   * @param endPoints - URLs for the substrate node
   * @param onError - Error handler for stage of instantiating a provider
   **/
  static async getApiPromise(
    appName: string,
    endPoints: string[],
    onError: ApiInitHandler['onError'],
    options?: { ignoreLog?: boolean }
  ) {
    const wsProvider = await new Promise<WsProvider>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        let wsProvider: WsProvider;
        let tryNumber = 0;
        let keepRetrying = true;
        let reportNewInteractiveError = true;

        // Listen for events from the websocket provider to the connect and disconnect and return a promise for blocking
        const connectWs = async (wsProvider: WsProvider) => {
          // perform a connection that won't reconnect if the connection failed to establish or due to broken-pipe (Ping connection)
          await wsProvider.connect();

          return new Promise((resolve, reject) => {
            wsProvider.on('connected', () => {
              resolve(wsProvider);
            });
            wsProvider.on('error', (e) => {
              if (!options?.ignoreLog) {
                console.log(e);
              }
              reject(new Error('WS Error '));
            });
          });
        };

        /**
         *  Infinite Looping till
         *  1- The ws connection is established
         *  2- The user killed the connection, no other retires
         **/
        // global interActiveFeedback for access on multiple scopes
        let interactiveFeedback: InteractiveFeedback | undefined = undefined;

        if (!options?.ignoreLog) {
          logger.trace('Trying to connect to ', endPoints, `Try: ${tryNumber}`);
        }

        while (keepRetrying) {
          wsProvider = new WsProvider(endPoints, false);

          /// don't wait for sleep time on the first attempt
          if (tryNumber !== 0) {
            /// sleep for 6s
            await new Promise((resolve) => setTimeout(resolve, 6000));
          }

          try {
            /// wait for ping connection
            if (!options?.ignoreLog) {
              logger.trace('Performing the ping connection');
            }
            await connectWs(wsProvider);
            /// disconnect the pin connection
            if (!options?.ignoreLog) {
              logger.info(`Ping connection Ok try: ${tryNumber}  for `, [
                endPoints,
              ]);
            }
            await wsProvider.disconnect();
            if (!options?.ignoreLog) {
              logger.trace('Killed the ping connection');
            }

            /// create a new WS Provider that is failure friendly and will retry to connect
            /// no need to call `.connect` the Promise api will handle this
            resolve(new WsProvider(endPoints));

            if (typeof interactiveFeedback !== 'undefined') {
              /// cancel the feedback as  the connection is established
              interactiveFeedback.cancelWithoutHandler();
            }

            break;
          } catch (_) {
            tryNumber++;

            if (!reportNewInteractiveError) {
              continue;
            }

            const body = InteractiveFeedback.feedbackEntries([
              {
                header: 'Failed to establish WS connection',
              },
              {
                content: `Attempt to retry (${tryNumber}) after 6s..`,
              },
            ]);

            const actions = InteractiveFeedback.actionsBuilder()
              .action('Wait for connection', () => {
                interactiveFeedback?.cancelWithoutHandler();
                reportNewInteractiveError = false;
              })
              .actions();

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            /// if the connection is established from the first time then there's no interActiveFeedback instance
            if (typeof interactiveFeedback !== 'undefined') {
              /// After failure there user is prompted that there is a connection failure the feedback from the previous attempt is canceled (dismissed)
              interactiveFeedback.cancelWithoutHandler();
            }

            interactiveFeedback = new InteractiveFeedback(
              'error',
              actions,
              () => {
                keepRetrying = false;
                reject(new Error('Disconnected'));
              },
              body
            );

            onError(interactiveFeedback);
          }
        }
      }
    );

    const apiPromise = await ApiPromise.create(
      apiOptions({
        provider: wsProvider,
        noInitWarn: true,
      })
    );

    return apiPromise;
  }

  /**
   * Get provider params
   * @param appName - Name of the application
   * @param endPoints - URLs for the substrate node
   * @param onError - Error handler for stage of instantiating a provider
   * @param wallet - Wallet to connect
   **/
  static async getParams(
    appName: string,
    endPoints: string[],
    onError: ApiInitHandler['onError'],
    wallet: Wallet
  ): Promise<[ApiPromise, InjectedExtension]> {
    // Import web3Enable for hooking with the browser extension
    const { web3Enable } = await import('@polkadot/extension-dapp');
    // Enable the app
    const extensions = await web3Enable(appName);

    logger.info('Extensions', extensions);

    // Check whether the extension is existed or not
    const currentExtension = extensions.find((ex) => ex.name === wallet.name);
    if (!currentExtension) {
      logger.warn(`${wallet.title} extension isn't installed`);

      switch (wallet.id) {
        case WalletId.Polkadot: {
          throw WebbError.from(WebbErrorCodes.PolkaDotExtensionNotInstalled);
        }

        case WalletId.Talisman: {
          throw WebbError.from(WebbErrorCodes.TalismanExtensionNotInstalled);
        }

        case WalletId.SubWallet: {
          throw WebbError.from(WebbErrorCodes.SubWalletExtensionNotInstalled);
        }

        default: {
          throw WebbError.from(WebbErrorCodes.UnknownWallet);
        }
      }
    }

    // Initialize an ApiPromise
    const apiPromise = await PolkadotProvider.getApiPromise(
      appName,
      endPoints,
      onError
    );

    return [apiPromise, currentExtension];
  }

  hookListeners() {
    this.apiPromise.on('error', () => {
      this.emit('error', undefined);
    });

    this.apiPromise.on('ready', () => {
      this.emit('ready', undefined);
    });
    this.apiPromise.on('connected', () => {
      this.emit('connected', undefined);
    });
    this.apiPromise.on('disconnected', () => {
      this.emit('disconnected', undefined);
    });

    this.injectedExtension.accounts?.subscribe((accounts) => {
      const polkadotAccounts = accounts
        .filter((account) => isValidAddress(account.address))
        .map((account) => new PolkadotAccount(account, account.address));

      this.emit('accountsChange', polkadotAccounts);
    });
  }

  destroy() {
    // close all listeners
    (
      Object.keys(this.subscriptions) as Array<keyof ExtensionProviderEvents>
    ).forEach((entry) => {
      const cbs = this.subscriptions[entry];

      // @ts-ignore
      cbs.forEach((cb) => this.off(entry, cb));
    }, this);

    // disconnect this api
    return this.apiPromise.disconnect();
  }

  /// metaData:MetadataDef
  updateMetaData(metaData: MetadataDef) {
    return this.injectedExtension.metadata?.provide(metaData);
  }

  /**
   * Get MetaData of the ext provider
   **/
  getMetaData() {
    if (!this.apiPromise.isConnected) {
      return;
    }

    const metadataDef = {
      chain: this.apiPromise.runtimeChain.toString(),
      genesisHash: this.apiPromise.genesisHash.toHex(),
      icon: 'substrate',
      metaCalls: Buffer.from(
        this.apiPromise.runtimeMetadata.asCallsOnly.toU8a()
      ).toString('base64'),
      specVersion: this.apiPromise.runtimeVersion.specVersion.toNumber(),
      ss58Format: isNumber(this.apiPromise.registry.chainSS58)
        ? this.apiPromise.registry.chainSS58
        : 42,
      tokenDecimals: isNumber(this.apiPromise.registry.chainDecimals)
        ? this.apiPromise.registry.chainDecimals
        : 12,
      tokenSymbol: this.apiPromise.registry.chainTokens[0] || 'Unit',
      types: {},
    } satisfies MetadataDef;

    logger.trace('Polkadot api metadata', metadataDef);

    return metadataDef;
  }

  /**
   *  Checks if MetaData has changed on the api and update it in the browser extension
   **/
  async checkMetaDataUpdate() {
    const metadataDef = this.getMetaData();
    const known = await this.injectedExtension?.metadata?.get();

    if (!known || !metadataDef) {
      return null;
    }

    const result = !known.find(({ genesisHash, specVersion }) => {
      return (
        metadataDef.genesisHash === genesisHash &&
        metadataDef.specVersion === specVersion
      );
    });

    if (result) {
      this.emit('updateMetaData', metadataDef);
    }

    return metadataDef;
  }

  get accounts() {
    return this._accounts;
  }

  get api() {
    return this.apiPromise;
  }
}
