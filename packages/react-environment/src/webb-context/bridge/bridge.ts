import { bridgeConfigByAsset, currenciesConfig, InternalChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { BridgeConfig } from '@webb-dapp/react-environment/types/bridge-config.interface';
import { CurrencyRole, CurrencyType } from '@webb-dapp/react-environment/types/currency-config.interface';

import { Currency } from '../currency/currency';

export class Bridge {
  private constructor(private bridgeConfig: BridgeConfig) {}

  static from(bridgeCurrency: WebbCurrencyId): Bridge {
    console.log('WebbCurrencyId in Bridge static constructor: ', bridgeCurrency);
    const bridgeConfig = bridgeConfigByAsset[bridgeCurrency];
    return new Bridge(bridgeConfig);
  }

  /*
   *  Get the bridge privy pools
   * */
  get anchors() {
    return this.bridgeConfig.anchors;
  }

  /*
   *  Get the bridge currency
   * */
  get currency() {
    return Currency.fromCurrencyId(this.bridgeConfig.asset);
  }

  getTokenAddress(chainId: InternalChainId) {
    return currenciesConfig[this.bridgeConfig.asset].addresses.get(chainId);
  }

  /*
   *  Get all Bridge tokens
   * */
  static getTokens(): Currency[] {
    const bridgeCurrenciesConfig = Object.values(currenciesConfig).filter((i) => i.role == CurrencyRole.Governable);
    return bridgeCurrenciesConfig.map((config) => {
      return Currency.fromCurrencyId(config.id);
    });
  }

  /*
   *  Get all Bridge tokens for a given chain
   * */
  static getTokensOfChain(chainId: InternalChainId): Currency[] {
    const tokens = Bridge.getTokens();
    return tokens.filter((token) => token.hasChain(chainId));
  }
}
