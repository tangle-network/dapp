import { ChainId } from '@webb-dapp/apps/configs';
import { Bridge } from '@webb-dapp/react-environment/webb-context/bridge/bridge';

import { MixerWithdraw } from '../mixer/mixer-withdraw';

export abstract class BridgeWithdraw<T> extends MixerWithdraw<T> {
  get tokens() {
    return Bridge.getTokens();
  }

  getTokensOfChain(chainId: ChainId) {
    return Bridge.getTokensOfChain(chainId);
  }
}
