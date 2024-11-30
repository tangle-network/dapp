// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { WebbApiProvider } from '../webb-provider.interface';

import { Currency } from '../currency';
import { Bridge } from '../state';

export type AnchorBase = {
  // Neighbors are indexed on their typedChainId
  neighbours: Record<number, string | number>;
};

export abstract class BridgeApi<
  T extends WebbApiProvider<any> = WebbApiProvider<any>,
> {
  public constructor(protected inner: T) {}

  getCurrency(): Currency | null {
    return null;
  }

  getBridge(): Bridge | null {
    return null;
  }

  getCurrencyById(_currencyId: number) {
    return null;
  }

  get bridges(): Bridge[] {
    return [];
  }

  setActiveBridge(_entry: Bridge) {
    // TODO: Remove this method
  }

  setBridgeByCurrency(currency: Currency | null) {
    if (!currency) {
      return;
    }
  }

  getTokenTarget(typedChainId: number): string | null {
    const activeBridgeAsset = this.getCurrency();
    return activeBridgeAsset
      ? (activeBridgeAsset.getAddress(typedChainId) ?? null)
      : null;
  }

  async getVAnchors(): Promise<AnchorBase[]> {
    return [];
  }

  abstract fetchWrappableAssets(typedChainId: number): Promise<Currency[]>;

  fetchWrappableAssetsByBridge(
    _typedChainId: number,
    _bridge: Bridge,
  ): Promise<Currency[]> {
    return Promise.resolve([]);
  }
}
