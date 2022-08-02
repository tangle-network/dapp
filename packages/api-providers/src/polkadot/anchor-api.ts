// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { calculateTypedChainId } from '@webb-tools/sdk-core';

import { AnchorApi, AnchorBase } from '../abstracts';
import { TypedChainId } from '../chains';
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
  getTokenAddress(chainTypeId: TypedChainId): string | null {
    const activeBridgeAsset = this.store.activeBridge?.asset;
    const typedChainId = calculateTypedChainId(chainTypeId.chainType, chainTypeId.chainId);
    return activeBridgeAsset
      ? this.inner.config.currencies[activeBridgeAsset].addresses.get(typedChainId) ?? null
      : null;
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
      this.store.activeBridge?.anchors.map((anchor: AnchorConfigEntry) => ({
        neighbours: anchor.anchorTreeIds,
      })) ?? []
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getWrappableAssets(chainId: TypedChainId): Promise<Currency[]> {
    return [];
  }
}
