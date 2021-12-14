import { ChainId } from '@webb-dapp/apps/configs';

import { BridgeAnchor, BridgeConfig, BridgeConfigEntry } from './bridge-config';
import { BridgeCurrency } from './bridge-currency';

export class Bridge {
  private constructor(private readonly configEntry: BridgeConfigEntry) {}

  static from(config: BridgeConfig, bridgeCurrency: BridgeCurrency): Bridge {
    const bridgeConfigEntry = config[bridgeCurrency.name];
    return new Bridge(bridgeConfigEntry);
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

  getTokenAddress(chainId: ChainId) {
    return this.configEntry.tokenAddresses[chainId];
  }

  /*
   *  Get all tokens
   * */
  static getTokens(config: BridgeConfig): BridgeCurrency[] {
    return Object.values(config).map((i) => i.asset);
  }

  static getTokensByAddress(config: BridgeConfig, addresses: string[]): BridgeCurrency[] {
    return Object.values(config)
      .filter((cfgEntry) => {
        const tokenAddress = Object.keys(cfgEntry.tokenAddresses).filter((key) => {
          const bridgeEntry = cfgEntry.tokenAddresses[key as unknown as ChainId]!;
          return addresses.includes(bridgeEntry);
        });
        return tokenAddress.length > 0;
      })
      .map((cfg) => cfg.asset);
  }

  /*
   *  Get tokens for a given chain
   * */
  static getTokensOfChain(config: BridgeConfig, chainId: ChainId): BridgeCurrency[] {
    const tokens = Bridge.getTokens(config);
    return tokens.filter((token) => token.hasChain(chainId));
  }

  /*
   *  Get tokens that all that supports given chains
   * */
  static getTokensOfChains(config: BridgeConfig, chainIds: ChainId[]): BridgeCurrency[] {
    const tokens = Bridge.getTokens(config);
    return tokens.filter((token) => {
      for (let chainId of chainIds) {
        if (!token.hasChain(chainId)) {
          return false;
        }
      }
      return true;
    });
  }

  static getConfigEntry(config: BridgeConfig, bridgeCurrency: BridgeCurrency): BridgeConfigEntry {
    return config[bridgeCurrency.name];
  }
}
