import { bridgeConfigByAsset, ChainId, currenciesConfig, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { BridgeConfig } from '@webb-dapp/react-environment/types/bridge-config.interface';
import { CurrencyType } from '@webb-dapp/react-environment/types/currency-config.interface';
import { Currency } from '../currency/currency';

export class Bridge {
  private constructor(private bridgeConfig: BridgeConfig, private asset: WebbCurrencyId ) {}

  static from(bridgeCurrency: WebbCurrencyId): Bridge {
    console.log('WebbCurrencyId in Bridge static constructor: ', bridgeCurrency);
    const bridgeConfig = bridgeConfigByAsset[bridgeCurrency];
    return new Bridge(bridgeConfig, bridgeCurrency);
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
    return this.bridgeConfig.asset;
  }

  getTokenAddress(chainId: ChainId) {
    return currenciesConfig[this.bridgeConfig.asset].addresses.get(chainId);
  }

  /*
   *  Get all tokens
   * */
  static getTokens(): Currency[] {
    const bridgeCurrenciesConfig = Object.values(currenciesConfig).filter((i) => i.type == CurrencyType.BridgeCurrency);
    return bridgeCurrenciesConfig.map((config) => {return Currency.fromCurrencyId(config.id)});
  }

  /*
   *  Get tokens for a given chain
   * */
  static getTokensOfChain(chainId: ChainId): Currency[] {
    const tokens = Bridge.getTokens();
    return tokens.filter((token) => token.hasChain(chainId));
  }
}
