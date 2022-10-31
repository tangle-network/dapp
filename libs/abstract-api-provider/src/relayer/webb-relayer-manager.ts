// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Note } from '@webb-tools/sdk-core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { OptionalActiveRelayer, OptionalRelayer, RelayerQuery } from './types';
import { WebbRelayer } from './webb-relayer';

export abstract class WebbRelayerManager {
  private activeRelayerSubject = new BehaviorSubject<OptionalActiveRelayer>(null);
  readonly activeRelayerWatcher: Observable<OptionalActiveRelayer>;
  private _listUpdated = new Subject<void>();
  public readonly listUpdated: Observable<void>;
  protected relayers: WebbRelayer[];
  public activeRelayer: OptionalActiveRelayer = null;

  constructor(relayers: WebbRelayer[]) {
    this.relayers = relayers;
    this.activeRelayerWatcher = this.activeRelayerSubject.asObservable();
    this.listUpdated = this._listUpdated.asObservable();
  }

  async setActiveRelayer(relayer: WebbRelayer | null, typedChainId: number): Promise<void> {
    const active = await this.mapRelayerIntoActive(relayer, typedChainId);

    this.activeRelayer = active;
    this.activeRelayerSubject.next(active);
  }

  addRelayer(relayer: WebbRelayer): void {
    this.relayers.push(relayer);
    this._listUpdated.next();
  }

  abstract mapRelayerIntoActive(relayer: OptionalRelayer, typedChainId: number): Promise<OptionalActiveRelayer>;

  /*
   *  get a list of the suitable relayers for a given query
   *  the list is randomized
   *  Accepts a 'RelayerQuery' object with optional, indexible fields.
   **/
  abstract getRelayers(query: RelayerQuery): WebbRelayer[];
  abstract getRelayersByNote(note: Note): Promise<WebbRelayer[]>;
  abstract getRelayersByChainAndAddress(typedChainId: number, address: string): Promise<WebbRelayer[]>;
}
