// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Note } from '@webb-tools/sdk-core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { ApiPromise } from '@polkadot/api';
import { VAnchor } from '@webb-tools/anchors';
import { BridgeStorage, LoggerService } from '@webb-tools/browser-utils';
import { Storage } from '@webb-tools/storage';
import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
} from '../transaction';
import calculateProvingLeavesAndCommitmentIndex from '../utils/calculateProvingLeavesAndCommitmentIndex';
import { WebbProviderType } from '../webb-provider.interface';
import { OptionalActiveRelayer, OptionalRelayer, RelayerQuery } from './types';
import { WebbRelayer } from './webb-relayer';

export abstract class WebbRelayerManager<Provider extends WebbProviderType> {
  protected readonly logger = LoggerService.get('RelayerManager');

  private activeRelayerSubject = new BehaviorSubject<OptionalActiveRelayer>(
    null
  );
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

  async setActiveRelayer(
    relayer: WebbRelayer | null,
    typedChainId: number
  ): Promise<void> {
    const active = await this.mapRelayerIntoActive(relayer, typedChainId);

    this.activeRelayer = active;
    this.activeRelayerSubject.next(active);
  }

  addRelayer(relayer: WebbRelayer): void {
    this.relayers.push(relayer);
    this._listUpdated.next();
  }

  abstract mapRelayerIntoActive(
    relayer: OptionalRelayer,
    typedChainId: number
  ): Promise<OptionalActiveRelayer>;

  /*
   *  get a list of the suitable relayers for a given query
   *  the list is randomized
   *  Accepts a 'RelayerQuery' object with optional, indexible fields.
   **/
  abstract getRelayers(query: RelayerQuery): WebbRelayer[];
  abstract getRelayersByNote(note: Note): Promise<WebbRelayer[]>;
  abstract getRelayersByChainAndAddress(
    typedChainId: number,
    address: string
  ): Promise<WebbRelayer[]>;

  /**
   * Fetch leaves from relayers
   * @param relayers the relayers to fetch leaves from
   * @param api the api to use to fetch leaves (either polkadot api or vanchor api)
   * @param storage the storage to use to cache leaves
   * @param options options for fetching leaves
   */
  abstract fetchLeavesFromRelayers(
    relayers: WebbRelayer[],
    api: Provider extends 'polkadot'
      ? ApiPromise
      : Provider extends 'web3'
      ? VAnchor
      : never,
    storage: Storage<BridgeStorage>,
    options: {
      treeHeight: number;
      targetRoot: string;
      commitment: bigint;
      importMetaUrl: string; // the url of the import.meta.url
      treeId: Provider extends 'polkadot' ? number : never;
      palletId: Provider extends 'polkadot' ? number : never;
      tx?: Transaction<NewNotesTxResult>;
    }
  ): Promise<{
    provingLeaves: string[];
    commitmentIndex: number;
  } | null>;

  /**
   * Validate the commitment is in the tree and get the proving leaves
   * from the leaves returned from the relayer
   */
  async validateRelayerLeaves(
    treeHeight: number,
    leaves: string[],
    targetRoot: string,
    commitment: bigint,
    tx?: Transaction<NewNotesTxResult>
  ): Promise<{
    provingLeaves: string[];
    commitmentIndex: number;
  } | null> {
    tx?.next(TransactionState.ValidatingLeaves, undefined);
    const { leafIndex, provingLeaves } =
      await calculateProvingLeavesAndCommitmentIndex(
        treeHeight,
        leaves,
        targetRoot,
        commitment.toString()
      );

    // If the leafIndex is -1, it means the commitment is not in the tree
    // and we should continue to the next relayer
    if (leafIndex === -1) {
      tx?.next(TransactionState.ValidatingLeaves, false);
      return null;
    } else {
      tx?.next(TransactionState.ValidatingLeaves, true);
    }

    return {
      provingLeaves,
      commitmentIndex: leafIndex,
    };
  }
}
