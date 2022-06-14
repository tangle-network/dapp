// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { AnchorApi, AnchorBase } from '../abstracts';
import { ChainTypeId } from '../chains';
import { AnchorConfigEntry } from '../types';
import { BridgeConfig } from '../types/bridge-config.interface';
import { CurrencyConfig, CurrencyRole, CurrencyType } from '../types/currency-config.interface';
import { Currency } from '../';
import { WebbPolkadot } from './webb-provider';

export class PolkadotAnchorApi extends AnchorApi<WebbPolkadot, BridgeConfig> {
  private get activeBridgeAsset() {
    return this.store.activeBridge?.asset ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTokenAddress(chainId: ChainTypeId): string | null {
    return null;
  }

  async getCurrencies(): Promise<Currency[]> {
    const bridgeCurrenciesConfig = Object.values(this.inner.config.currencies).filter((i: CurrencyConfig) => {
      const isValid = i.type === CurrencyType.ORML && i.role === CurrencyRole.Governable;
      const isSupported = Object.keys(this.store.config).includes(i.id.toString());

      return isValid && isSupported;
    });

    return bridgeCurrenciesConfig.map((config: CurrencyConfig) => {
      return Currency.fromCurrencyId(this.inner.config.currencies, config.id);
    });
  }

  get currency(): Currency | null {
    return this.activeBridgeAsset
      ? Currency.fromCurrencyId(this.inner.config.currencies, this.activeBridgeAsset)
      : null;
  }

  async getAnchors(): Promise<AnchorBase[]> {
    return (
      this.store.activeBridge?.anchors.map((anchor: AnchorConfigEntry) =>
        anchor.type === 'fixed'
          ? {
              amount: anchor.amount,
              neighbours: anchor.anchorTreeIds,
            }
          : {
              neighbours: anchor.anchorTreeIds,
            }
      ) ?? []
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getWrappableAssets(chainId: ChainTypeId): Promise<Currency[]> {
    return [];
  }
}
