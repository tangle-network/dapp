import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { BehaviorSubject, Observable } from 'rxjs';

import { Currency } from '../currency/currency';

export type BridgeCurrencyIndex = string | WebbCurrencyId;

type BridgeStore<BridgeConfigEntry, BridgeConfig = Record<BridgeCurrencyIndex, BridgeConfigEntry>> = {
  config: BridgeConfig;
  activeBridge?: BridgeConfigEntry;
};
export type AnchorBase = {
  amount: string | number;
  neighbours: {
    [key in ChainId]?: string | number;
  };
};
export abstract class BridgeApi<Api, BridgeConfigEntry> {
  private readonly _store: BehaviorSubject<BridgeStore<BridgeConfigEntry>>;
  private readonly _watcher: Observable<BridgeStore<BridgeConfigEntry>>;

  protected constructor(protected inner: Api, initialStore: BridgeStore<BridgeConfigEntry>) {
    this._store = new BehaviorSubject(initialStore);
    this._watcher = this._store.asObservable();
  }

  get store(): BridgeStore<BridgeConfigEntry> {
    return this._store.value;
  }

  protected set store(next: Partial<BridgeStore<BridgeConfigEntry>>) {
    this._store.next({ ...this.store, ...next });
  }

  abstract getCurrency(currencyId: BridgeCurrencyIndex): Promise<Currency | null>;

  abstract getCurrencies(): Promise<Currency[]>;

  // For evm
  abstract getTokenAddress(currencyId: BridgeCurrencyIndex, chainId: ChainId): string | null;

  abstract getAnchors(): Promise<AnchorBase[]>;
  ///
  setActiveBridge(activeBridge: BridgeConfigEntry | undefined) {
    this.store = {
      ...this.store,
      activeBridge: activeBridge,
    };
  }
}
