// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  InjectedExtension,
  MetadataDef,
} from '@polkadot/extension-inject/types';
import { LoggerService } from '@webb-tools/browser-utils';
import { Wallet } from '@webb-tools/dapp-config';
import getPolkadotBasedWallet from '@webb-tools/dapp-config/utils/getPolkadotBasedWallet';
import WalletNotInstalledError from '@webb-tools/dapp-types/errors/WalletNotInstalledError';
import { EventBus } from '@webb-tools/dapp-types/EventBus';
import lodash from 'lodash';
import { isValidAddress } from './is-valid-address';
import { PolkadotAccount, PolkadotAccounts } from './polkadot-accounts';
import { fromUint8Array } from 'js-base64';

const { isNumber } = lodash;

type ExtensionProviderEvents = {
  connected: undefined;
  disconnected: undefined;
  error: undefined;
  ready: undefined;

  updateMetaData: MetadataDef;

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
    wallet: Wallet,
  ): Promise<PolkadotProvider> {
    const [endPoint, ...allEndPoints] = endPoints;
    const [apiPromise, currentExtensions] = await PolkadotProvider.getParams(
      appName,
      [endPoint, ...allEndPoints],
      wallet,
    );

    return new PolkadotProvider(apiPromise, currentExtensions);
  }

  /**
   * Get the api Promise
   * @param endPoints - URLs for the substrate node
   * @param onError - Error handler for stage of instantiating a provider
   **/
  static async getApiPromise(
    endPoints: string[],
    options?: {
      ignoreLog?: boolean;
      maxTries?: number;
    },
  ) {
    const wsProvider = await new Promise<WsProvider>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        let wsProvider: WsProvider;
        let tryNumber = 0;
        let keepRetrying = true;

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

            break;
          } catch (_) {
            // If the maxTries is reached then exit the loop
            if (
              typeof options?.maxTries === 'number' &&
              tryNumber >= options.maxTries
            ) {
              await wsProvider.disconnect();
              keepRetrying = false;
              reject(new Error('Max tries reached'));
              break;
            }

            tryNumber++;
          }
        }
      },
    );

    const apiPromise = await ApiPromise.create({
      provider: wsProvider,
      noInitWarn: true,
    });

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
    wallet: Wallet,
  ): Promise<[ApiPromise, InjectedExtension]> {
    // Check whether the extension is existed or not
    const currentExtension = await getPolkadotBasedWallet(appName, wallet.name);

    if (!currentExtension) {
      logger.warn(`${wallet.title} extension isn't installed`);
      throw new WalletNotInstalledError(wallet.id);
    }

    // Initialize an ApiPromise
    const apiPromise = await PolkadotProvider.getApiPromise(endPoints, {
      maxTries: 3,
    });

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

    const metadataDef: MetadataDef = {
      chain: this.apiPromise.runtimeChain.toString(),
      genesisHash: this.apiPromise.genesisHash.toHex(),
      icon: 'substrate',
      metaCalls: fromUint8Array(
        this.apiPromise.runtimeMetadata.asCallsOnly.toU8a(),
      ),
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
