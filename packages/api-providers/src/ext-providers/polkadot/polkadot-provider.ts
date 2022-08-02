// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-ts-comment */

import { options } from '@webb-tools/api';
import { EventBus, LoggerService } from '@webb-tools/app-util';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import lodash from 'lodash';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { InjectedExtension } from '@polkadot/extension-inject/types';

import { ApiInitHandler } from '../../';
import { PolkaTXBuilder } from '../../polkadot';
import { InteractiveFeedback, WebbError, WebbErrorCodes } from '../../webb-error';
import { PolkadotAccount, PolkadotAccounts } from './polkadot-accounts';

const { isNumber } = lodash;

type ExtensionProviderEvents = {
  connected: undefined;
  disconnected: undefined;
  error: undefined;
  ready: undefined;

  updateMetaData: Record<string, any>;

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
   **/
  static async fromExtension(
    appName: string,
    endPoints: string[],
    apiInitHandler: ApiInitHandler,
    txBuilder: PolkaTXBuilder
  ): Promise<PolkadotProvider> {
    const [endPoint, ...allEndPoints] = endPoints;
    const [apiPromise, currentExtensions] = await PolkadotProvider.getParams(
      appName,
      [endPoint, ...allEndPoints],
      apiInitHandler.onError
    );

    return new PolkadotProvider(apiPromise, currentExtensions, txBuilder);
  }

  /**
   * Get the api Promise
   * @param appName - Name of the application
   * @param endPoints - URLs for the substrate node
   * @param onError - Error handler for stage of instantiating a provider
   **/
  static async getApiPromise(appName: string, endPoints: string[], onError: ApiInitHandler['onError']) {
    const [endPoint, ...allEndPoints] = endPoints;
    // eslint-disable-next-line no-async-promise-executor
    const wsProvider = await new Promise<WsProvider>(async (resolve, reject) => {
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
            console.log(e);
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
      let interActiveFeedback: InteractiveFeedback;

      logger.trace('Trying to connect to ', [endPoint, ...allEndPoints], `Try: ${tryNumber}`);

      while (keepRetrying) {
        wsProvider = new WsProvider([endPoint, ...allEndPoints], false);

        /// don't wait for sleep time on the first attempt
        if (tryNumber !== 0) {
          /// sleep for 6s
          await new Promise((resolve) => setTimeout(resolve, 6000));
        }

        try {
          /// wait for ping connection
          logger.trace('Performing the ping connection');
          await connectWs(wsProvider);
          /// disconnect the pin connection
          logger.info(`Ping connection Ok try: ${tryNumber}  for `, [endPoint, ...allEndPoints]);
          await wsProvider.disconnect();
          logger.trace('Killed the ping connection');

          /// create a new WS Provider that is failure friendly and will retry to connect
          /// no need to call `.connect` the Promise api will handle this
          resolve(new WsProvider([endPoint, ...allEndPoints]));

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (typeof interActiveFeedback !== 'undefined') {
            /// cancel the feedback as  the connection is established
            interActiveFeedback.cancelWithoutHandler();
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
              interActiveFeedback?.cancelWithoutHandler();
              reportNewInteractiveError = false;
            })
            .actions();

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          /// if the connection is established from the first time then there's no interActiveFeedback instance
          if (typeof interActiveFeedback !== 'undefined') {
            /// After failure there user is prompted that there is a connection failure the feedback from the previous attempt is canceled (dismissed)
            interActiveFeedback.cancelWithoutHandler();
          }

          interActiveFeedback = new InteractiveFeedback(
            'error',
            actions,
            () => {
              keepRetrying = false;
              reject(new Error('Disconnected'));
            },
            body
          );

          onError(interActiveFeedback);
        }
      }
    });

    const apiPromise = await ApiPromise.create(
      options({
        provider: wsProvider,
        rpc: {
          lt: {
            getNeighborEdges: {
              description: 'Query for the neighbor edges',
              params: [
                {
                  name: 'tree_id',
                  type: 'u32',
                  isOptional: false,
                },
                {
                  name: 'at',
                  type: 'Hash',
                  isOptional: true,
                },
              ],
              type: 'Vec<PalletLinkableTreeEdgeMetadata>',
            },
            getNeighborRoots: {
              description: 'Query for the neighbor roots',
              params: [
                {
                  name: 'tree_id',
                  type: 'u32',
                  isOptional: false,
                },
                {
                  name: 'at',
                  type: 'Hash',
                  isOptional: true,
                },
              ],
              type: 'Vec<[u8; 32]>',
            },
          },
        },
      })
    );

    return apiPromise;
  }

  /**
   * Get provider params
   * @param appName - Name of the application
   * @param endPoints - URLs for the substrate node
   * @param onError - Error handler for stage of instantiating a provider
   **/
  static async getParams(
    appName: string,
    endPoints: string[],
    onError: ApiInitHandler['onError']
  ): Promise<[ApiPromise, InjectedExtension]> {
    const [endPoint, ...allEndPoints] = endPoints;
    // Import web3Enable for hooking with the browser extension
    const { web3Enable } = await import('@polkadot/extension-dapp');
    // Enable the app
    const extensions = await web3Enable(appName);

    logger.info('Extensions', extensions);

    // Check for extensions length to insure polkadot extension is installed
    if (extensions.length === 0) {
      logger.warn("Polkadot extension isn't installed");
      throw WebbError.from(WebbErrorCodes.PolkaDotExtensionNotInstalled);
    }

    const currentExtensions = extensions[0];
    // Initialize an ApiPromise
    const apiPromise = await PolkadotProvider.getApiPromise(appName, [endPoint, ...allEndPoints], onError);

    return [apiPromise, currentExtensions];
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
      const polkadotAccounts = accounts.map((account) => new PolkadotAccount(account, account.address));

      this.emit('accountsChange', polkadotAccounts);
    });
  }

  destroy() {
    // close all listeners
    (Object.keys(this.subscriptions) as Array<keyof ExtensionProviderEvents>).forEach((entry) => {
      const cbs = this.subscriptions[entry];

      // @ts-ignore
      cbs.forEach((cb) => this.off(entry, cb));
    }, this);

    // disconnect this api
    return this.apiPromise.disconnect();
  }

  /// metaData:MetadataDef
  updateMetaData(metaData: any) {
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
      metaCalls: Buffer.from(this.apiPromise.runtimeMetadata.asCallsOnly.toU8a()).toString('base64'),
      specVersion: this.apiPromise.runtimeVersion.specVersion.toNumber(),
      ss58Format: isNumber(this.apiPromise.registry.chainSS58) ? this.apiPromise.registry.chainSS58 : 42,
      tokenDecimals: isNumber(this.apiPromise.registry.chainDecimals) ? this.apiPromise.registry.chainDecimals : 12,
      tokenSymbol: this.apiPromise.registry.chainTokens[0] || 'Unit',
      types: options({}).types as any,
    };

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
      return metadataDef.genesisHash === genesisHash && metadataDef.specVersion === specVersion;
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
