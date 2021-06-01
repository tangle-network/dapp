import { web3Enable } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { optionsWithEdgeware as options } from '@webb-tools/api';
import { EventBus } from '@webb-tools/app-util';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { isNumber } from 'lodash';
import { PolkadotAccount, PolkadotAccounts } from '@webb-dapp/wallet/providers/polkadot/polkadot-accounts';

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

  constructor(protected apiPromise: ApiPromise, protected injectedExtension: InjectedExtension) {
    super();
    this.hookListeners();
    this._accounts = new PolkadotAccounts(this.injectedExtension);
  }

  static async fromExtension(appName: string, [endPoint, ...allEndPoints]: string[]): Promise<PolkadotProvider> {
    const [apiPromise, currentExtensions] = await PolkadotProvider.getParams(appName, [endPoint, ...allEndPoints]);
    const polkadotProvider = new PolkadotProvider(apiPromise, currentExtensions);
    return polkadotProvider;
  }

  static async getParams(
    appName: string,
    [endPoint, ...allEndPoints]: string[]
  ): Promise<[ApiPromise, InjectedExtension]> {
    const extensions = await web3Enable(appName);
    if (extensions.length === 0) throw new Error('no_extensions');
    const currentExtensions = extensions[0];
    const wsProvider = new WsProvider([endPoint, ...allEndPoints]);
    const opts = options({
      provider: wsProvider,
    });
    const apiPromise = await ApiPromise.create(opts);
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
    this.apiPromise.disconnect();
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
    if (!known || !metadataDef) return false;

    const result = !known.find(({ genesisHash, specVersion }) => {
      return metadataDef.genesisHash === genesisHash && metadataDef.specVersion === specVersion;
    });

    if (result) this.emit('updateMetaData', metadataDef);
  }

  get accounts() {
    return this._accounts;
  }

  get api() {
    return this.apiPromise;
  }
}
