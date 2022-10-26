// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { CurrencyConfig, CurrencyView } from '@nepoche/dapp-config';
import { CurrencyRole } from '@nepoche/dapp-types';

/**
 * The abstract class for representing the values need to display a Currency on the UI
 **/
export abstract class CurrencyContent {
  abstract get view(): CurrencyView;
}

/**
 *
 * This currency class assumes that instances are wrappable assets.
 **/
export class Currency {
  constructor(private data: CurrencyConfig) {}

  get id() {
    return this.data.id;
  }

  getAddress(chain: number): string | undefined {
    return this.data.addresses.get(chain);
  }

  hasChain(chain: number): boolean {
    return this.data.addresses.has(chain);
  }

  getChainIds(): number[] {
    return Array.from(this.data.addresses.keys());
  }

  getAddresses(): string[] {
    return Array.from(this.data.addresses.values());
  }
  getAddressOfChain(chain: number): string | undefined {
    return this.data.addresses.get(chain);
  }
  getDecimals(): number {
    return this.data.decimals || 0;
  }

  getRole(): CurrencyRole {
    return this.data.role;
  }

  get view(): CurrencyView {
    return {
      color: this.data.color,
      icon: this.data.icon,
      id: this.data.id as any,
      name: this.data.name,
      decimals: this.data.decimals,
      symbol: this.data.symbol,
      type: this.data.type,
    };
  }
}
