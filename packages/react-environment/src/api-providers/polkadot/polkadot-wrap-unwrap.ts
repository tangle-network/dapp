import { WrapUnWrap } from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { WebbPolkadot } from '@webb-dapp/react-environment/api-providers';
import { MixerSize } from '@webb-dapp/react-environment';

export class PolkadotWrapUnwrap extends WrapUnWrap<WebbPolkadot> {
  canWrap(wrapPayload: any): Promise<boolean> {
    return Promise.resolve(false);
  }

  getSizes(): Promise<MixerSize[]> {
    return Promise.resolve([]);
  }

  getTokensAddress(): Promise<string> {
    return Promise.resolve('');
  }

  unwrap(unwrapPayload: any): Promise<string> {
    return Promise.resolve('');
  }

  wrap(wrapPayload: any): Promise<string> {
    return Promise.resolve('');
  }
}
