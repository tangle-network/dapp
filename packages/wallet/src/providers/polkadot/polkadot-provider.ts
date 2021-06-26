import { PolkaTXBuilder } from '@webb-dapp/react-environment/api-providers/polkadot';
import { PolkadotAccount, PolkadotAccounts } from '@webb-dapp/wallet/providers/polkadot/polkadot-accounts';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import { optionsWithEdgeware as options } from '@webb-tools/api';
import { EventBus } from '@webb-tools/app-util';
import { isNumber } from 'lodash';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable } from '@polkadot/extension-dapp';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { ApiInitHandler, InteractiveFeedback } from '@webb-dapp/react-environment';

type ExtensionProviderEvents = {
  connected: undefined;
  disconnected: undefined;
  error: undefined;
  ready: undefined;

  updateMetaData: Object;

  accountsChange: PolkadotAccount[];
};

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
    const polkadotProvider = new PolkadotProvider(apiPromise, currentExtensions);
    return polkadotProvider;
  }

  static async getParams(
    appName: string,
    [endPoint, ...allEndPoints]: string[],
    onError: ApiInitHandler['onError']
  ): Promise<[ApiPromise, InjectedExtension]> {
    const extensions = await web3Enable(appName);
    if (extensions.length === 0) throw new Error('no_extensions');
    const currentExtensions = extensions[0];
    // eslint-disable-next-line no-async-promise-executor
    const wsProvider = await new Promise<WsProvider>(async (resolve, reject) => {
      let wsProvider: WsProvider;
      let tryNumber = 0;
      let keepRetrying = true;
      const connectWs = (wsProvider: WsProvider) => {
        return new Promise((res, rej) => {
          wsProvider.on('connected', () => {
            res(wsProvider);
          });
          wsProvider.on('error', () => {
            rej();
          });
        });
      };
      while (keepRetrying) {
        let interActiveFeedback: InteractiveFeedback;
        wsProvider = new WsProvider([endPoint, ...allEndPoints], false);
        // @ts-ignore
        if (typeof interActiveFeedback !== 'undefined') {
          interActiveFeedback.cancel();
        }
        if (tryNumber !== 0) {
          await new Promise((r) => setTimeout(r, 6000));
        }

        await wsProvider.connect();

        try {
          await connectWs(wsProvider);
          await wsProvider.disconnect();
          wsProvider = new WsProvider([endPoint, ...allEndPoints]);
          resolve(wsProvider);
          // @ts-ignore
          if (typeof interActiveFeedback !== 'undefined') {
            interActiveFeedback.cancel();
          }
          break;
        } catch (_) {
          tryNumber++;

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
              interActiveFeedback?.cancel();
            })
            .actions();
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
