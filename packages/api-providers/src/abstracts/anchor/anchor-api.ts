// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Currency, TypedChainId, WebbCurrencyId } from '../../';

export type BridgeCurrencyIndex = WebbCurrencyId;

type BridgeStore<BridgeConfigEntry, BridgeConfig = Record<BridgeCurrencyIndex, BridgeConfigEntry>> = {
  config: BridgeConfig;
  activeBridge?: BridgeConfigEntry;
};
export type AnchorBase = {
  amount?: string | number;
  // Neighbors are indexed on their TypedChainId
  neighbours: Record<number, string | number>;
};
/**
 * Providers the data related to the Anchors it can be implemented over the static configurations or fetching on chain data
 * @param currency - Active bridge asset
 * @param Currencies -
 **/
export abstract class AnchorApi<Api, BridgeConfigEntry> {
  private readonly _store: BehaviorSubject<BridgeStore<BridgeConfigEntry>>;
  private readonly _watcher: Observable<BridgeStore<BridgeConfigEntry>>;

  public constructor(protected inner: Api, initialStore: Record<BridgeCurrencyIndex, BridgeConfigEntry>) {
    this._store = new BehaviorSubject({
      config: initialStore,
    });
    this._watcher = this._store.asObservable();
  }

  get $store() {
    return this._watcher;
  }

  get store(): BridgeStore<BridgeConfigEntry> {
    return this._store.value;
  }

  get bridgeIds() {
    return Object.keys(this.store.config);
  }

  // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
  set store(next: Partial<BridgeStore<BridgeConfigEntry>>) {
    this._store.next({ ...this.store, ...next });
  }

  abstract get currency(): Currency | null;

  abstract getCurrencies(): Promise<Currency[]>;

  // For evm
  abstract getTokenAddress(chainId: TypedChainId): string | null;

  get activeBridge(): BridgeConfigEntry | undefined {
    return this.store.activeBridge;
  }

  abstract getAnchors(): Promise<Array<AnchorBase>>;

  async getVariableAnchors(): Promise<Array<Omit<AnchorBase, 'amount'> & { amount: number | string }>> {
    const allAnchors = await this.getAnchors();
    return allAnchors.filter((a) => typeof a.amount === 'undefined') as any;
  }

  setActiveBridge(activeBridge: BridgeConfigEntry | undefined) {
    this.store = {
      ...this.store,
      activeBridge: activeBridge,
    };
  }

  abstract getWrappableAssets(chainId: TypedChainId): Promise<Currency[]>;

  /*
   *  Get all Bridge tokens for a given chain
   **/
  async getTokensOfChain(typedChainId: TypedChainId): Promise<Currency[]> {
    const tokens = await this.getCurrencies();
    return tokens.filter((token) =>
      token.hasChain(calculateTypedChainId(typedChainId.chainType, typedChainId.chainId))
    );
  }
}
