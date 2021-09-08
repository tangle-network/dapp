import { ChainId } from '@webb-dapp/apps/configs';

import { BridgeAnchor, BridgeConfig, BridgeConfigEntry } from './bridge-config';
import { BridgeCurrency } from './bridge-currency';

export class Bridge {
  private constructor(private readonly configEntry: BridgeConfigEntry) {}

  static from(bridgeCurrency: BridgeCurrency, config: BridgeConfig): Bridge {
    const bridgeConfigEntries = config[bridgeCurrency.name];
    return new Bridge(bridgeConfigEntries);
  }

  /*
   *  Get the bridge privy pools
   * */
  get anchors(): BridgeAnchor[] {
    return this.configEntry.anchors;
  }

  /*
   *  Get the bridge currency
   * */
  get currency() {
    return this.configEntry.asset;
  }

  /*
   *  Get all tokens
   * */
  static getTokens(configEntry: BridgeConfig): BridgeCurrency[] {
    return Object.values(configEntry).map((i) => i.asset);
  }

  /*
   *  Get tokens for a given chain
   * */
  static GetTokensOfChain(configEntry: BridgeConfig, chainId: ChainId): BridgeCurrency[] {
    const tokens = Bridge.getTokens(configEntry);
    return tokens.filter((token) => token.hasChain(chainId));
  }

  /*
   *  Get tokens that all that supports given chains
   * */
  static getTokensOfChains(configEntry: BridgeConfig, chainIds: ChainId[]): BridgeCurrency[] {
    const tokens = Bridge.getTokens(configEntry);
    return tokens.filter((token) => {
      for (let chainId of chainIds) {
        if (!token.hasChain(chainId)) {
          return false;
        }
      }
      return true;
    });
  }
}
