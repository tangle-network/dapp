import { ChainId } from '@webb-dapp/apps/configs';
import { DepositPayload, MixerDeposit } from '@webb-dapp/react-environment';
import { Bridge } from '@webb-dapp/react-environment/webb-context/bridge/bridge';
import { BridgeConfig } from '@webb-dapp/react-environment/webb-context/bridge/bridge-config';

export abstract class BridgeDeposit<T, K extends DepositPayload = DepositPayload<any>> extends MixerDeposit<T, K> {
  abstract bridgeConfig: BridgeConfig;

  get tokens() {
    return Bridge.getTokens(this.bridgeConfig);
  }

  getTokensOfChain(chainId: ChainId) {
    return Bridge.GetTokensOfChain(this.bridgeConfig, chainId);
  }

  getTokensOfChains(chainIds: ChainId[]) {
    return Bridge.getTokensOfChains(this.bridgeConfig, chainIds);
  }
}
