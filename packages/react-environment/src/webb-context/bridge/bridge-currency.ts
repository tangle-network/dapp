import { ChainId, WebbCurrencyId, webbCurrencyIdFromString, webbCurrencyIdToString } from '@webb-dapp/apps/configs';
import { getNameFromBridgeCurrencyId } from './bridge-config';

/*
 *
 * Bridge Currency (Bridge name)
 *
 *  Example:
 *  A bridge between Ethereum and Edgware with the currency ETH
 *  will be ${named} = webb$ETH (The wrapped currency)
 *  the string that defines the bridge chains is the ${ChainId} of the two anchors
 *  for Edgeware => 0 , for Ethereum(main net)  =>  3
 *  the token name will be webb$ETH-0-3  (the wrapped Eth token the is bridged between Ethereum and Edgware)
 *
 *  2Token Example:
 *  A bridge between Rinkeby and Ropsten for ETH and WETH
 *  will be ${named} = webb$ETH$WETH-4-5
 * */
export class BridgeCurrency {
  public readonly name: string;

  constructor(private chains: ChainId[], private wrappedCurrencies: WebbCurrencyId[], name: string) {
    this.chains = chains.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
    this.wrappedCurrencies = wrappedCurrencies.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
    this.name = name;
  }

  toString(): string {
    const paraChains = this.chains.join('-');
    let baseCurrencies = '';
    this.wrappedCurrencies.forEach((currency) => {
      baseCurrencies = baseCurrencies + '$' + webbCurrencyIdToString(currency);
    });
    console.log('baseCurrencies: ', baseCurrencies);
    return `webb${baseCurrencies}-${paraChains}`;
  }

  get prefix(): string {
    let baseCurrencies = '';
    this.wrappedCurrencies.forEach((currency) => {
      baseCurrencies = baseCurrencies + '$' + webbCurrencyIdToString(currency);
    });
    return `webb${baseCurrencies}`;
  }

  static fromString(strBridgeCurrency: string): BridgeCurrency {
    const parts = strBridgeCurrency.split('-');
    // parse the currencies used for the bridge and remove the 'webb' prefix
    let currencies = parts[0].split('$').splice(1);
    let wrappedCurrencies: WebbCurrencyId[] = currencies.map((c) => {
      return webbCurrencyIdFromString(c);
    });

    let chainIds = parts.slice(1, parts.length).map((c) => Number(c) as ChainId);
    const webbTokenName = getNameFromBridgeCurrencyId(strBridgeCurrency);
    return new BridgeCurrency(chainIds, wrappedCurrencies, webbTokenName);
  }

  hasChain(chainId: ChainId): boolean {
    return this.chains.includes(chainId);
  }

  get currencyIds(): WebbCurrencyId[] {
    return this.wrappedCurrencies;
  }

  get chainIds(): ChainId[] {
    return this.chains;
  }
}
