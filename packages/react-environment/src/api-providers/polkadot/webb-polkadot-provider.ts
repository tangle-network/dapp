import { PolkadotMixerDeposit, PolkadotMixerWithdraw } from '@webb-dapp/react-environment/api-providers/polkadot';
import { WebbApiProvider, WebbMethods } from '@webb-dapp/react-environment/webb-context';
import { PolkadotProvider } from '@webb-dapp/wallet/providers/polkadot/polkadot-provider';
import { Storage, StorageHandler } from '@webb-dapp/utils/storage';
import { ApiPromise } from '@polkadot/api';
import { InjectedExtension } from '@polkadot/extension-inject/types';

type PolkadotStorage = {
  [treeId: string]: {
    // currencyId: string;
    [chainId: string]: {
      leaves: string[];
    };
  };
};
const polkadotStorageHandler: StorageHandler<PolkadotStorage> = {
  inner: {},
  async fetch(key: string): Promise<PolkadotStorage> {
    const data = localStorage.getItem(key);
    if (!data) {
      return {};
    }
    return JSON.parse(data);
  },
  async commit(key: string, data: PolkadotStorage): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data));
  },
};

export class WebbPolkadot extends PolkadotProvider implements WebbApiProvider<WebbPolkadot> {
  readonly methods: WebbMethods<WebbPolkadot>;

  private constructor(
    apiPromise: ApiPromise,
    injectedExtension: InjectedExtension,
    readonly storage: Storage<PolkadotStorage>
  ) {
    super(apiPromise, injectedExtension);
    this.methods = {
      mixer: {
        deposit: {
          inner: new PolkadotMixerDeposit(this),
          enabled: true,
        },
        withdraw: {
          inner: new PolkadotMixerWithdraw(this),
          enabled: true,
        },
      },
    };
  }

  static async init(appName: string, endpoints: string[]): Promise<WebbPolkadot> {
    const [apiPromise, injectedExtension] = await PolkadotProvider.getParams(appName, endpoints);
    const storage = await Storage.newFromCache<PolkadotStorage>('polka-storage', polkadotStorageHandler);
    const instance = new WebbPolkadot(apiPromise, injectedExtension, storage);
    await apiPromise.isReady;
    return instance;
  }
}
