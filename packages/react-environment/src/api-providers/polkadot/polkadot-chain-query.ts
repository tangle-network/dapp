import { WebbCurrencyId } from '@webb-dapp/apps/configs';
import { ChainQuery } from '@webb-dapp/react-environment/webb-context/chain-query';

import { WebbPolkadot } from './webb-polkadot-provider';

export class PolkadotChainQuery extends ChainQuery<WebbPolkadot> {
  constructor(protected inner: WebbPolkadot) {
    super(inner);
  }

  async tokenBalanceByCurrencyId(currency: WebbCurrencyId): Promise<string> {
    return '';
  }

  async tokenBalanceByAddress(address: string): Promise<string> {
    return '';
  }
}
