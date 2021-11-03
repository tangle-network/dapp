import { WrapUnWrap } from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers';
import { MixerSize } from '@webb-dapp/react-environment';

export class Web3WrapUnwrap extends WrapUnWrap<WebbWeb3Provider> {
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
