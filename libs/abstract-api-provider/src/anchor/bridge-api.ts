// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { WebbApiProvider } from '../webb-provider.interface';

import { Currency } from '../currency';
import { Bridge } from '../state';

export type AnchorBase = {
  amount?: string | number;
  // Neighbors are indexed on their typedChainId
  neighbours: Record<number, string | number>;
};
/**
 * The BridgeApi is meant for interactions on the WebbState's activeBridge.
 * Most of the state in the dApp is derived from the selected activeBridge.
 **/
export abstract class BridgeApi<T extends WebbApiProvider<any> = WebbApiProvider<any>> {
  public constructor(protected inner: T) {}

  getCurrency(): Currency | null {
    return this.inner.state.activeBridge?.currency ?? null;
  }

  getBridge(): Bridge | null {
    return this.inner.state.activeBridge;
  }

  getCurrencyById(currencyId: number) {
    const bridgeCurrency = Object.values(this.inner.state.getCurrencies()).find((currency) => {
      return currency.id === currencyId;
    });
    return bridgeCurrency ?? null;
  }

  get bridges(): Bridge[] {
    return Object.values(this.inner.state.getBridgeOptions());
  }

  setActiveBridge(entry: Bridge) {
    this.inner.state.activeBridge = entry;
  }

  setBridgeByCurrency(currency: Currency) {
    this.inner.state.activeBridge =
      this.bridges.find((bridge) => {
        return bridge.currency.id === currency.id;
      }) ?? null;
  }

  getTokenTarget(typedChainId: number): string | null {
    const activeBridgeAsset = this.getCurrency();
    return activeBridgeAsset ? activeBridgeAsset.getAddress(typedChainId) ?? null : null;
  }

  async getAnchors(): Promise<AnchorBase[]> {
    return this.inner.state.activeBridge
      ? [
          {
            neighbours: this.inner.state.activeBridge.targets,
          },
        ]
      : [];
  }

  abstract fetchWrappableAssets(typedChainId: number): Promise<Currency[]>;
}
