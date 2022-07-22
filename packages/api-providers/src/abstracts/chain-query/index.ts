// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

// The chain query class returns information from the selected provider

import { CurrencyId } from '../../enums';

export abstract class ChainQuery<Provider> {
  constructor(protected inner: Provider) {}

  abstract currentBlock(): Promise<number>;
  abstract tokenBalanceByCurrencyId(typedChainId: number, currency: CurrencyId): Promise<string>;
  abstract tokenBalanceByAddress(address: string): Promise<string>;
}
