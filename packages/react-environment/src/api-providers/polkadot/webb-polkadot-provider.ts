import { PolkadotMixerDeposit, PolkadotMixerWithdraw } from '@webb-dapp/react-environment/api-providers/polkadot';
import {
  ActionsBuilder,
  ApiInitHandler,
  InterActiveFeedback,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
} from '@webb-dapp/react-environment/webb-context';
import { PolkadotAccounts } from '@webb-dapp/wallet/providers/polkadot/polkadot-accounts';
import { PolkadotProvider } from '@webb-dapp/wallet/providers/polkadot/polkadot-provider';
import { EventBus } from '@webb-tools/app-util';

import { ApiPromise } from '@polkadot/api';
import { InjectedExtension } from '@polkadot/extension-inject/types';

export class WebbPolkadot extends EventBus<WebbProviderEvents> implements WebbApiProvider<WebbPolkadot> {
  readonly methods: WebbMethods<WebbPolkadot>;
  private readonly provider: PolkadotProvider;
  accounts: PolkadotAccounts;

  private constructor(apiPromise: ApiPromise, injectedExtension: InjectedExtension) {
    super();
    this.provider = new PolkadotProvider(apiPromise, injectedExtension);
    this.accounts = this.provider.accounts;
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

  async awaitMetaDataCheck() {
    /// delay some time till the UI is instantiated and then check if the dApp needs to update extension meta data
    await new Promise((r) => setTimeout(r, 3000));
    const metaData = await this.provider.checkMetaDataUpdate();
    if (metaData) {
      /// feedback body
      const feedbackEntries = InterActiveFeedback.feedbackEntries([
        {
          header: 'Update Polkadot MetaData',
        },
      ]);
      /// feedback actions
      const actions = ActionsBuilder.init()
        /// update extension metadata
        .action('Update MetaData', () => this.provider.updateMetaData(metaData), 'success')
        .actions();
      const feedback = new InterActiveFeedback('info', actions, () => {}, feedbackEntries);
      /// emit the feedback object
      this.emit('interactiveFeedback', feedback);
    }
  }

  static async init(appName: string, endpoints: string[], errorHandler: ApiInitHandler): Promise<WebbPolkadot> {
    const [apiPromise, injectedExtension] = await PolkadotProvider.getParams(appName, endpoints, errorHandler.onError);
    const instance = new WebbPolkadot(apiPromise, injectedExtension);
    /// check metadata update
    await instance.awaitMetaDataCheck();
    await apiPromise.isReady;
    return instance;
  }

  async destroy(): Promise<void> {
    await this.provider.destroy();
  }
}
