import { ApiInitHandler } from '@webb-dapp/react-environment';
import { PolkaTXBuilder } from '@webb-dapp/react-environment/api-providers/polkadot';
import { InteractiveFeedback, WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { PolkadotAccount, PolkadotAccounts } from '@webb-dapp/wallet/providers/polkadot/polkadot-accounts';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import { optionsWithEdgeware as options } from '@webb-tools/api';
import { EventBus, LoggerService } from '@webb-tools/app-util';
import { isNumber } from 'lodash';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable } from '@polkadot/extension-dapp';
import { InjectedExtension } from '@polkadot/extension-inject/types';

type ExtensionProviderEvents = {
  connected: undefined;
  disconnected: undefined;
  error: undefined;
  ready: undefined;

  updateMetaData: Object;

  accountsChange: PolkadotAccount[];
};
const logger = LoggerService.get('Polkadot-Provider');

export class PolkadotProvider extends EventBus<ExtensionProviderEvents> {
  private _accounts: PolkadotAccounts;
  public txBuilder: PolkaTXBuilder;

  constructor(protected apiPromise: ApiPromise, protected injectedExtension: InjectedExtension) {
    super();
    this.txBuilder = new PolkaTXBuilder(this.apiPromise, transactionNotificationConfig);
    this.hookListeners();
    this._accounts = new PolkadotAccounts(this.injectedExtension);
  }

  static async fromExtension(
    appName: string,
    [endPoint, ...allEndPoints]: string[],
    apiInitHandler: ApiInitHandler
  ): Promise<PolkadotProvider> {
    const [apiPromise, currentExtensions] = await PolkadotProvider.getParams(
      appName,
      [endPoint, ...allEndPoints],
      apiInitHandler.onError
    );
    return new PolkadotProvider(apiPromise, currentExtensions);
  }

  static async getParams(
    appName: string,
    [endPoint, ...allEndPoints]: string[],
    onError: ApiInitHandler['onError']
  ): Promise<[ApiPromise, InjectedExtension]> {
    const extensions = await web3Enable(appName);
    logger.info('Extensions', extensions);
    if (extensions.length === 0) {
      logger.warn(`Polkadot extension isn't installed`);
      throw WebbError.from(WebbErrorCodes.PolkaDotExtensionNotInstalled);
    }
    const currentExtensions = extensions[0];
    // eslint-disable-next-line no-async-promise-executor
    const wsProvider = await new Promise<WsProvider>(async (resolve, reject) => {
      let wsProvider: WsProvider;
      let tryNumber = 0;
      let keepRetrying = true;
      let reportNewInteractiveError = true;
      /// Listen for events from the websocket provider to the connect and disconnect and return a promise for blocking
      const connectWs = async (wsProvider: WsProvider) => {
        /// perform a connection that won't reconnect if the connection failed to establish or due to broken-pipe (Ping connection)
        await wsProvider.connect();
        return new Promise((res, rej) => {
          wsProvider.on('connected', () => {
            res(wsProvider);
          });
          wsProvider.on('error', () => {
            rej();
          });
        });
      };
      /**
       *  Infinite Looping till
       *  1- The ws connection is established
       *  2- The user killed the connection , no other retires
       * */
      /// global interActiveFeedback for access on multiple scopes
      let interActiveFeedback: InteractiveFeedback;
      logger.trace(`Trying to connect to `, [endPoint, ...allEndPoints], `Try: ${tryNumber}`);
      while (keepRetrying) {
        wsProvider = new WsProvider([endPoint, ...allEndPoints], false);

        /// don't wait for sleep time on the first attempt
        if (tryNumber !== 0) {
          /// sleep for 6s
          await new Promise((r) => setTimeout(r, 6000));
        }

        try {
          /// wait for ping connection
          logger.trace(`Performing the ping connection`);
          await connectWs(wsProvider);
          /// disconnect the pin connection
          logger.info(`Ping connection Ok try: ${tryNumber}  for `, [endPoint, ...allEndPoints]);
          wsProvider.disconnect().then(() => {
            logger.trace(`Killed the ping connection`);
          });
          /// create a new WS Provider that is failure friendly and will retry to connect
          /// no need to call `.connect` the Promise api will handle this
          resolve(new WsProvider([endPoint, ...allEndPoints]));
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
              reject('Disconnected');
            },
            body
          );

          onError(interActiveFeedback);
        }
      }
    });

    const opts = options({
      provider: wsProvider,
    });
    logger.trace('Api Promise options', opts);

    const apiPromise = await ApiPromise.create(opts);
    return [apiPromise, currentExtensions];
  }

  hookListeners() {
    this.apiPromise.on('error', (e) => {
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

    this.injectedExtension.accounts.subscribe((accounts) => {
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
    this.injectedExtension.metadata?.provide(metaData);
  }

  getMetaData() {
    if (!this.apiPromise.isConnected) return;
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
    return metadataDef;
  }

  async checkMetaDataUpdate() {
    const metadataDef = this.getMetaData();
    const known = await this.injectedExtension?.metadata?.get();
    if (!known || !metadataDef) return null;

    const result = !known.find(({ genesisHash, specVersion }) => {
      return metadataDef.genesisHash === genesisHash && metadataDef.specVersion === specVersion;
    });

    if (result) this.emit('updateMetaData', metadataDef);
    return metadataDef;
  }

  get accounts() {
    return this._accounts;
  }

  get api() {
    return this.apiPromise;
  }
}
