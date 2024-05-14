// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { BridgeStorage, LoggerService } from '@webb-tools/browser-utils';
import { VAnchor__factory } from '@webb-tools/contracts';
import Storage from '@webb-tools/dapp-types/Storage.js';
import { Note } from '@webb-tools/sdk-core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { GetContractReturnType, PublicClient } from 'viem';
import {
  NewNotesTxResult,
  TransactionExecutor,
  TransactionState,
} from '../transaction/transactionExecutor.js';
import calculateProvingLeavesAndCommitmentIndex from '../utils/calculateProvingLeavesAndCommitmentIndex.js';
import { WebbProviderType } from '../types.js';
import {
  OptionalActiveRelayer,
  OptionalRelayer,
  RelayerQuery,
} from './types.js';
import { WebbRelayer } from './webb-relayer.js';
import { type RelayerCMDBase } from '@webb-tools/dapp-config/relayer-config.js';

export abstract class WebbRelayerManager<
  Provider extends WebbProviderType,
  CMDKey extends RelayerCMDBase
> {
  protected supportedPallet: string | undefined;

  protected readonly logger = LoggerService.get('RelayerManager');

  private activeRelayerSubject = new BehaviorSubject<OptionalActiveRelayer>(
    null
  );
  readonly activeRelayerWatcher: Observable<OptionalActiveRelayer>;
  private _listUpdated = new Subject<void>();

  public readonly listUpdated: Observable<void>;
  public readonly listUpdated$ = this._listUpdated;

  protected relayers: WebbRelayer[];
  public activeRelayer: OptionalActiveRelayer = null;

  abstract cmdKey: CMDKey;

  constructor(relayers: WebbRelayer[]) {
    this.relayers = relayers;
    this.activeRelayerWatcher = this.activeRelayerSubject.asObservable();
    this.listUpdated = this._listUpdated.asObservable();
  }

  setActiveRelayer(relayer: WebbRelayer | null, typedChainId: number): void {
    const active = this.mapRelayerIntoActive(relayer, typedChainId);

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
  ): OptionalActiveRelayer;

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
  ): Array<WebbRelayer>;

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
      ? GetContractReturnType<typeof VAnchor__factory.abi, PublicClient>
      : never,
    storage: Storage<BridgeStorage>,
    options: {
      treeHeight: number;
      targetRoot: string;
      commitment: bigint;
      importMetaUrl: string; // the url of the import.meta.url
      treeId: Provider extends 'polkadot' ? number : never;
      palletId: Provider extends 'polkadot' ? number : never;
      tx?: TransactionExecutor<NewNotesTxResult>;
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
    tx?: TransactionExecutor<NewNotesTxResult>
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
