// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
import { CurrencyRole } from '@nepoche/dapp-types';
import { BehaviorSubject, Observable } from 'rxjs';

import { Currency } from '../currency';

export interface WebbStateInterface {
  wrappableCurrency: Currency | null;
  $wrappableCurrency: Observable<Currency | null>;
  wrappableCurrencies: Record<number, Currency>;
  $wrappableCurrencies: Observable<Record<number, Currency>>;
  activeBridge: Bridge | null;
  $activeBridge: Observable<Bridge | null>;
}

// The Bridge class tracks the state of the selected governed currency,
// The targets are indexed by typedChainIds, and the string value could
// represent either an address or a treeId.
// These fields are all readonly, because an observable for an activeBridge is
// exposed on the WebbState, and updates are encouraged via the 'bridgeApi'.
export class Bridge {
  constructor(readonly currency: Currency, readonly targets: Record<number, string>) {
    this.currency = currency;
    this.targets = targets;
  }
}

/// The WebbState is updated by WebbMethods. Components can observe a WebbApiProvider's
/// state and subscribe to updates

export class WebbState implements WebbStateInterface {
  // A wrappableToken can be set on the bridge
  private wrappableToken = new BehaviorSubject<Currency | null>(null);
  // A list of available wrappableCurrencies that a user can
  private wrappableTokens = new BehaviorSubject<Record<number, Currency>>({});
  private activeBridgeSubject = new BehaviorSubject<Bridge | null>(null);

  //  CurrencyId => Currency
  private wrappedTokens = new BehaviorSubject<Record<any, Currency>>({});
  private wrappedToken = new BehaviorSubject<Currency | null>(null);

  constructor(
    // Currencies are indexed by their Currency IDs
    private supportedCurrencies: Record<number, Currency>,
    // Bridges are indexed by their governed Currency IDs.
    private supportedBridges: Record<number, Bridge>
  ) {
    const wrappedCurrencies: Record<number, Currency> = {};

    Object.keys(this.supportedBridges).forEach((key) => {
      const currencyId = Number(key);
      if (this.supportedBridges[currencyId].currency.getRole() === CurrencyRole.Governable) {
        wrappedCurrencies[currencyId] = this.supportedBridges[currencyId].currency;
      }
    });
    this.wrappedCurrencies = wrappedCurrencies;
  }

  get wrappableCurrency() {
    return this.wrappableToken.value;
  }

  get $wrappableCurrency() {
    return this.wrappableToken.asObservable();
  }

  set wrappableCurrency(value: Currency | null) {
    this.wrappableToken.next(value);
  }

  get wrappableCurrencies() {
    return this.wrappableTokens.value;
  }

  get $wrappableCurrencies() {
    return this.wrappableTokens.asObservable();
  }

  set wrappableCurrencies(value: Record<number, Currency>) {
    this.wrappableTokens.next(value);
  }

  get wrappedCurrency() {
    return this.wrappedToken.value;
  }

  get $wrappedCurrency() {
    return this.wrappedToken.asObservable();
  }

  set wrappedCurrency(value: Currency | null) {
    this.wrappedToken.next(value);
  }

  get wrappedCurrencies() {
    return this.wrappedTokens.value;
  }

  get $wrappedCurrencies() {
    return this.wrappedTokens.asObservable();
  }

  set wrappedCurrencies(value: Record<number, Currency>) {
    this.wrappedTokens.next(value);
  }

  get $activeBridge() {
    return this.activeBridgeSubject.asObservable();
  }

  get activeBridge() {
    return this.activeBridgeSubject.value;
  }

  set activeBridge(bridge: Bridge | null) {
    this.activeBridgeSubject.next(bridge);
  }

  addCurrency(currency: Currency) {
    this.supportedCurrencies[currency.id] = currency;
  }

  getReverseCurrencyMap(): Map<string, number> {
    let contractMapping = new Map();

    Object.values(this.supportedCurrencies).forEach((currency) => {
      currency.getAddresses().forEach((addressEntry) => {
        contractMapping.set(addressEntry, currency.id);
      });
    });

    return contractMapping;
  }

  getReverseCurrencyMapWithChainId(typedChainId: number): Map<string, number> {
    let contractMapping = new Map();
    Object.values(this.supportedCurrencies).forEach((currency) => {
      if (currency.getAddressOfChain(typedChainId) !== undefined) {
        currency.getAddresses().forEach((addressEntry) => {
          contractMapping.set(addressEntry, currency.id);
        });
      }
    });

    return contractMapping;
  }

  getCurrencies() {
    return this.supportedCurrencies;
  }

  getBridgeOptions() {
    return this.supportedBridges;
  }

  setBridgeOptions(bridges: Record<number, Bridge>) {
    this.supportedBridges = bridges;
  }
}
