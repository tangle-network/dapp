import { PolkadotMixerDeposit } from '@webb-dapp/react-environment/api-providers/polkadot-mixer-deposit';
import { PolkadotMixerWithdraw } from '@webb-dapp/react-environment/api-providers/polkadot-mixer-withdraw';
import { WebbApiProvider, WebbMethods } from '@webb-dapp/react-environment/webb-context';
import { PolkadotProvider } from '@webb-dapp/wallet/providers/polkadot/polkadot-provider';

import { ApiPromise } from '@polkadot/api';
import { InjectedExtension } from '@polkadot/extension-inject/types';

export class WebbPolkadot extends PolkadotProvider implements WebbApiProvider<WebbPolkadot> {
  readonly methods: WebbMethods<WebbPolkadot>;

  private constructor(apiPromise: ApiPromise, injectedExtension: InjectedExtension) {
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
    const instance = new WebbPolkadot(apiPromise, injectedExtension);
    await apiPromise.isReady;
    return instance;
  }
}
