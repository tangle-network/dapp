// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
import '@webb-tools/protocol-substrate-types';

import { Currency, RelayChainMethods } from '@webb-tools/abstract-api-provider';
import {
  ApiInitHandler,
  NotificationHandler,
  ProvideCapabilities,
  WasmFactory,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
} from '@webb-tools/abstract-api-provider';
import { AccountsAdapter } from '@webb-tools/abstract-api-provider/account/Accounts.adapter';
import { Bridge, WebbState } from '@webb-tools/abstract-api-provider/state';
import {
  ActionsBuilder,
  CurrencyRole,
  InteractiveFeedback,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import { ApiConfig, Wallet } from '@webb-tools/dapp-config';
import { NoteManager } from '@webb-tools/note-manager';
import { EventBus } from '@webb-tools/app-util';
import {
  calculateTypedChainId,
  ChainType,
  ResourceId,
} from '@webb-tools/sdk-core';

import { ApiPromise } from '@polkadot/api';
import {
  InjectedAccount,
  InjectedExtension,
} from '@polkadot/extension-inject/types';

import { PolkadotBridgeApi } from './webb-provider/bridge-api';
import { PolkadotChainQuery } from './webb-provider/chain-query';
import { PolkadotCrowdloan } from './webb-provider/crowdloan';
import { PolkadotECDSAClaims } from './webb-provider/ecdsa-claims';
import { PolkadotRelayerManager } from './webb-provider/relayer-manager';
import { PolkadotVAnchorActions } from './webb-provider/vanchor-actions';
import { PolkadotWrapUnwrap } from './webb-provider/wrap-unwrap';
import { PolkadotProvider } from './ext-provider';
import { PolkaTXBuilder } from './transaction';
import { BehaviorSubject, Observable } from 'rxjs';
import { ZkComponents } from '@webb-tools/utils';
import { providers } from 'ethers';

export class WebbPolkadot
  extends EventBus<WebbProviderEvents>
  implements WebbApiProvider<WebbPolkadot>
{
  type(): string {
    return 'Polkadot';
  }
  state: WebbState;
  noteManager: NoteManager | null = null;
  readonly methods: WebbMethods<WebbPolkadot>;
  readonly relayChainMethods: RelayChainMethods<WebbPolkadot>;
  readonly api: ApiPromise;
  readonly txBuilder: PolkaTXBuilder;
  private _newBlock = new BehaviorSubject<null | number>(null);

  private constructor(
    apiPromise: ApiPromise,
    readonly typedChainId: number,
    injectedExtension: InjectedExtension,
    readonly relayerManager: PolkadotRelayerManager,
    public readonly config: ApiConfig,
    readonly notificationHandler: NotificationHandler,
    private readonly provider: PolkadotProvider,
    readonly accounts: AccountsAdapter<InjectedExtension, InjectedAccount>,
    readonly wasmFactory: WasmFactory
  ) {
    super();
    this.provider = new PolkadotProvider(
      apiPromise,
      injectedExtension,
      new PolkaTXBuilder(apiPromise, notificationHandler, injectedExtension)
    );
    this.accounts = this.provider.accounts;
    this.api = this.provider.api;
    this.txBuilder = this.provider.txBuilder;
    this.relayChainMethods = {
      crowdloan: {
        enabled: true,
        inner: new PolkadotCrowdloan(this),
      },
    };
    this.methods = {
      bridgeApi: new PolkadotBridgeApi(this),
      chainQuery: new PolkadotChainQuery(this),
      claim: {
        core: new PolkadotECDSAClaims(this),
        enabled: true,
      },
      variableAnchor: {
        actions: {
          enabled: false,
          inner: new PolkadotVAnchorActions(this),
        },
      },
      wrapUnwrap: {
        core: {
          enabled: true,
          inner: new PolkadotWrapUnwrap(this),
        },
      },
    };
    // Take the configured values in the config and create objects used in the
    // api (e.g. Record<number, CurrencyConfig> => Currency[])
    const initialSupportedCurrencies: Record<number, Currency> = {};
    for (const currencyConfig of Object.values(config.currencies)) {
      initialSupportedCurrencies[currencyConfig.id] = new Currency(
        currencyConfig
      );
    }

    // All supported bridges are supplied by the config, before passing to the state.
    const initialSupportedBridges: Record<number, Bridge> = {};
    for (const bridgeConfig of Object.values(config.bridgeByAsset)) {
      if (Object.keys(bridgeConfig.anchors).includes(typedChainId.toString())) {
        const bridgeCurrency = initialSupportedCurrencies[bridgeConfig.asset];
        const bridgeTargets = bridgeConfig.anchors;
        if (bridgeCurrency.getRole() === CurrencyRole.Governable) {
          initialSupportedBridges[bridgeConfig.asset] = new Bridge(
            bridgeCurrency,
            bridgeTargets
          );
        }
      }
    }

    this.state = new WebbState(
      initialSupportedCurrencies,
      initialSupportedBridges
    );

    // set the available bridges of the new chain
    this.state.setBridgeOptions(initialSupportedBridges);

    // Select a reasonable default bridge
    this.state.activeBridge = Object.values(initialSupportedBridges)[0] ?? null;
  }

  capabilities?: ProvideCapabilities | undefined;

  getProvider() {
    return this.provider;
  }

  // Return the typedChainId of this provider
  // TODO: Find out how to get this value from chain
  //       Maybe the polkadot webb-provider does not interact with a 'linkableTreeBn254' pallet
  //       (it is for the dkg)
  getChainId() {
    // const chainType = await this.provider.api.consts.linkableTreeBn254.chainType;
    return this.typedChainId;
  }

  async getResourceId(): Promise<ResourceId | null> {
    throw new Error('Method not implemented.');
    return null;
  }

  async awaitMetaDataCheck() {
    /// delay some time till the UI is instantiated and then check if the dApp needs to update extension meta data
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const metaData = await this.provider.checkMetaDataUpdate();

    if (metaData) {
      /// feedback body
      const feedbackEntries = InteractiveFeedback.feedbackEntries([
        {
          header: 'Update Polkadot MetaData',
        },
      ]);
      /// feedback actions
      const actions = ActionsBuilder.init()
        /// update extension metadata
        .action(
          'Update MetaData',
          () => this.provider.updateMetaData(metaData),
          'success'
        )
        .actions();
      const feedback = new InteractiveFeedback(
        'info',
        actions,
        () => {
          return null;
        },
        feedbackEntries
      );

      /// emit the feedback object
      this.emit('interactiveFeedback', feedback);
    }
  }

  async ensureApiInterface() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const merkleRPC = Boolean(this.api.rpc.mt.getLeaves);
    // merkle rpc
    const merklePallet = this.api.query.merkleTreeBn254;
    const vAnchorPallet = this.api.query.vAnchorBn254;
    if (!merklePallet || !merkleRPC || !vAnchorPallet) {
      throw WebbError.from(WebbErrorCodes.InsufficientProviderInterface);
    }

    return true;
  }

  static async init(
    appName: string, // App name, arbitrary name
    endpoints: string[], // Endpoints of the substrate node
    errorHandler: ApiInitHandler, // Error handler that will be used to catch errors while initializing the provider
    relayerBuilder: PolkadotRelayerManager, // Webb Relayer builder for relaying withdraw
    ApiConfig: ApiConfig, // The whole and current app configuration
    notification: NotificationHandler, // Notification handler that will be used for the provider
    wasmFactory: WasmFactory, // A Factory Fn that wil return wasm worker that would be supplied eventually to the `sdk-core`
    typedChainId: number,
    wallet: Wallet // Current wallet to initialize
  ): Promise<WebbPolkadot> {
    const [apiPromise, injectedExtension] = await PolkadotProvider.getParams(
      appName,
      endpoints,
      errorHandler.onError,
      wallet
    );
    const provider = new PolkadotProvider(
      apiPromise,
      injectedExtension,
      new PolkaTXBuilder(apiPromise, notification, injectedExtension)
    );
    const accounts = provider.accounts;
    const instance = new WebbPolkadot(
      apiPromise,
      typedChainId,
      injectedExtension,
      relayerBuilder,
      ApiConfig,
      notification,
      provider,
      accounts,
      wasmFactory
    );
    /// check metadata update
    await instance.awaitMetaDataCheck();
    await apiPromise.isReady;
    // await instance.ensureApiInterface();
    const unsub = await instance.listenerBlocks();
    instance.destroy = async () => {
      await instance.destroy();
      unsub();
    };
    return instance;
  }

  static async initWithCustomAccountsAdapter(
    appName: string, // App name Arbitrary name
    endpoints: string[], // Endpoints of the substrate node
    errorHandler: ApiInitHandler, // Error handler that will be used to catch errors while initializing the provider
    relayerBuilder: PolkadotRelayerManager, // Webb Relayer builder for relaying withdraw
    ApiConfig: ApiConfig, // The whole and current app configuration
    notification: NotificationHandler, // Notification handler that will be used for the provider
    accounts: AccountsAdapter<InjectedExtension, InjectedAccount>,
    apiPromise: ApiPromise,
    injectedExtension: InjectedExtension,
    wasmFactory: WasmFactory
  ): Promise<WebbPolkadot> {
    const provider = new PolkadotProvider(
      apiPromise,
      injectedExtension,
      new PolkaTXBuilder(apiPromise, notification, injectedExtension)
    );
    const chainId = await provider.api.consts.linkableTreeBn254.chainIdentifier;
    const typedChainId = calculateTypedChainId(
      ChainType.Substrate,
      chainId.toNumber()
    );
    const instance = new WebbPolkadot(
      apiPromise,
      typedChainId,
      injectedExtension,
      relayerBuilder,
      ApiConfig,
      notification,
      provider,
      accounts,
      wasmFactory
    );

    await instance.ensureApiInterface();
    /// check metadata update
    await instance.awaitMetaDataCheck();
    await apiPromise.isReady;
    const unsub = await instance.listenerBlocks();
    instance.destroy = async () => {
      await instance.destroy();
      unsub();
    };
    return instance;
  }

  async destroy(): Promise<void> {
    await this.provider.destroy();
  }
  private async listenerBlocks() {
    const block = await this.provider.api.query.system.number();
    this._newBlock.next(block.toNumber());
    const sub = await this.provider.api.rpc.chain.subscribeFinalizedHeads(
      (header) => {
        this._newBlock.next(header.number.toNumber());
      }
    );
    return sub;
  }
  get newBlock(): Observable<number | null> {
    return this._newBlock.asObservable();
  }

  async getZkFixtures(
    maxEdges: number,
    isSmall?: boolean
  ): Promise<ZkComponents> {
    throw new Error('Method not implemented.');
  }

  async getVAnchorMaxEdges(
    vAnchorAddress: string,
    provider?: providers.Provider
  ): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
