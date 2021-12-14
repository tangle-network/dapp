import { WebbCurrencyId } from '@webb-dapp/apps/configs';

// The chain query class returns information from the selected provider
export abstract class ChainQuery<Provider> {
  constructor(protected inner: Provider) {}

  abstract tokenBalanceByCurrencyId(currency: WebbCurrencyId): Promise<string>;
  abstract tokenBalanceByAddress(address: string): Promise<string>;
}
