'use client';

// Copyright 2024 @tangle-network/
// SPDX-License-Identifier: Apache-2.0
import '@tangle-network/tangle-substrate-types';
import {
  WebbApiProvider,
  WebbProviderEvents,
} from '@tangle-network/abstract-api-provider';
import { AccountsAdapter } from '@tangle-network/abstract-api-provider/account/Accounts.adapter';
import { ApiConfig, Wallet } from '@tangle-network/dapp-config';
import { WebbError, WebbErrorCodes } from '@tangle-network/dapp-types';
import { EventBus } from '@tangle-network/dapp-types/EventBus';
import { parseTypedChainId } from '@tangle-network/dapp-types/TypedChainId';

import { ApiPromise } from '@polkadot/api';
import {
  InjectedAccount,
  InjectedExtension,
} from '@polkadot/extension-inject/types';

import { VoidFn } from '@polkadot/api/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { PolkadotAccounts, PolkadotProvider } from './ext-provider';

export class WebbPolkadot
  extends EventBus<WebbProviderEvents>
  implements WebbApiProvider
{
  readonly type = 'polkadot';

  readonly api: ApiPromise;

  readonly newBlockSub = new Set<VoidFn>();

  readonly typedChainidSubject: BehaviorSubject<number>;

  private _newBlock = new BehaviorSubject<null | bigint>(null);

  private constructor(
    readonly apiPromise: ApiPromise,
    typedChainId: number,
    readonly injectedExtension: InjectedExtension,
    readonly config: ApiConfig,
    private readonly provider: PolkadotProvider,
    readonly accounts: AccountsAdapter<InjectedExtension, InjectedAccount>,
  ) {
    super();

    this.typedChainidSubject = new BehaviorSubject<number>(typedChainId);

    this.accounts = this.provider.accounts;
    this.api = this.provider.api;
  }

  getProvider() {
    return this.provider;
  }

  getBlockNumber(): bigint | null {
    return this._newBlock.getValue();
  }

  async getChainId(): Promise<number> {
    const chainIdentifier =
      this.provider.api.consts.linkableTreeBn254.chainIdentifier;
    if (!chainIdentifier.isEmpty) {
      return parseInt(chainIdentifier.toHex());
    }

    // If the chainId is not set, fallback to the typedChainId
    return parseTypedChainId(this.typedChainId).chainId;
  }

  async awaitMetaDataCheck() {
    return this.provider.checkMetaDataUpdate();
  }

  static async init(
    appName: string, // App name, arbitrary name
    endpoints: string[], // Endpoints of the substrate node
    apiConfig: ApiConfig, // The whole and current app configuration
    typedChainId: number,
    wallet: Wallet, // Current wallet to initialize
  ): Promise<WebbPolkadot> {
    const [apiPromise, injectedExtension] = await PolkadotProvider.getParams(
      appName,
      endpoints,
      wallet,
    );

    const accountsFromExtension = await injectedExtension.accounts.get();
    if (accountsFromExtension.length === 0) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const provider = new PolkadotProvider(apiPromise, injectedExtension);
    const accounts = new PolkadotAccounts(injectedExtension);
    const instance = new WebbPolkadot(
      apiPromise,
      typedChainId,
      injectedExtension,
      apiConfig,
      provider,
      accounts,
    );

    await apiPromise.isReady;

    const unsub = await instance.listenerBlocks();
    instance.newBlockSub.add(unsub);

    return instance;
  }

  static async getApiPromise(endpoint: string): Promise<ApiPromise> {
    return PolkadotProvider.getApiPromise([endpoint]);
  }

  async destroy(): Promise<void> {
    await this.provider.destroy();
    this.newBlockSub.forEach((unsub) => unsub());
  }

  private async listenerBlocks() {
    const block = await this.provider.api.query.system.number();
    this._newBlock.next(block.toBigInt());
    const sub = await this.provider.api.rpc.chain.subscribeFinalizedHeads(
      (header) => {
        this._newBlock.next(header.number.toBigInt());
      },
    );
    return sub;
  }

  get newBlock(): Observable<bigint | null> {
    return this._newBlock.asObservable();
  }

  get typedChainId(): number {
    return this.typedChainidSubject.getValue();
  }

  async sign(message: string): Promise<string> {
    const account = await this.accounts.activeOrDefault;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    // this injector object has a signer and a signRaw method
    // to be able to sign raw bytes
    const signRaw = this.injectedExtension.signer?.signRaw;

    if (!signRaw) {
      throw WebbError.from(WebbErrorCodes.NoSignRaw);
    }

    const { signature } = await signRaw({
      address: account.address,
      data: message,
      type: 'bytes',
    });

    return signature;
  }
}
