import {
  ChainId,
  WebbCurrencyId,
  webbCurrencyIdFromString,
  webbCurrencyIdToString,
} from '@webb-dapp/apps/configs';

/*
 *
 * Bridge Currency (Bridge name)
 *
 *  Example:
 *  A bridge between Ethereum and Edgware with the currency ETH
 *  will be ${named} = webbETH (The wrapped currency)
 *  the string that defines the bridge chains is the ${ChainId} of the two anchors
 *  for Edgware => 0 , for Ethereum(main net)  =>  3
 *  the token name will be webbEth-0-3  (the wrapped Eth token the is bridged between Ethereum and Edgware)
 * */
export class BridgeCurrency {
  public readonly name: string;

  constructor(private chains: ChainId[], private wrappedCurrency: WebbCurrencyId) {
    this.chains = this.chains.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
    this.name = this.toString();
  }

  private toString(): string {
    const paraChains = this.chains.join('-');
    const baseCurrency = webbCurrencyIdToString(this.wrappedCurrency);
    return `webb${baseCurrency}-${paraChains}`;
  }
  get prefix(): string {
    return `webb${webbCurrencyIdToString(this.wrappedCurrency)}`;
  }
  static fromString(strBridgeCurrency: string): BridgeCurrency {
    const parts = strBridgeCurrency.split('-');
    let prefix = parts[0].replace('webb', '');
    let chainIds = parts.slice(1, parts.length).map((c) => Number(c) as ChainId);
    let wrappedCurrency = webbCurrencyIdFromString(prefix);
    return new BridgeCurrency(chainIds, wrappedCurrency);
  }

  hasChain(chainId: ChainId): boolean {
    return this.chains.includes(chainId);
  }

  get currencyId(): WebbCurrencyId {
    return this.wrappedCurrency;
  }

  get chainIds(): ChainId[] {
    return this.chains;
  }
}
