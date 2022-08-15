// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
import '@webb-tools/types';

import { EventBus } from '@webb-tools/app-util';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

import { ApiPromise } from '@polkadot/api';
import { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types';

import { Currency, RelayChainMethods } from '../abstracts';
import { Bridge, WebbState } from '../abstracts/state';
import { AccountsAdapter } from '../account/Accounts.adapter';
import { PolkadotProvider } from '../ext-providers';
import { NoteManager } from '../notes';
import { ActionsBuilder, InteractiveFeedback, WebbError, WebbErrorCodes } from '../webb-error';
import {
  ApiInitHandler,
  AppConfig,
  NotificationHandler,
  ProvideCapabilities,
  WasmFactory,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
} from '../';
import { PolkadotBridgeApi } from './bridge-api';
import { PolkadotChainQuery } from './chain-query';
import { PolkadotCrowdloan } from './crowdloan';
import { PolkadotMixerDeposit } from './mixer-deposit';
import { PolkadotMixerWithdraw } from './mixer-withdraw';
import { PolkadotRelayerManager } from './relayer-manager';
import { PolkaTXBuilder } from './transaction';
import { PolkadotVAnchorDeposit } from './vanchor-deposit';
import { PolkadotVAnchorWithdraw } from './vanchor-withdraw';
import { PolkadotWrapUnwrap } from './wrap-unwrap';

export class WebbPolkadot extends EventBus<WebbProviderEvents> implements WebbApiProvider<WebbPolkadot> {
  state: WebbState;
  noteManager: NoteManager | null = null;
  readonly methods: WebbMethods<WebbPolkadot>;
  readonly relayChainMethods: RelayChainMethods<WebbPolkadot>;
  readonly api: ApiPromise;
  readonly txBuilder: PolkaTXBuilder;

  private constructor(
    apiPromise: ApiPromise,
    readonly typedChainId: number,
    injectedExtension: InjectedExtension,
    readonly relayerManager: PolkadotRelayerManager,
    public readonly config: AppConfig,
    readonly notificationHandler: NotificationHandler,
    private readonly provider: PolkadotProvider,
    readonly accounts: AccountsAdapter<InjectedExtension, InjectedAccount>,
    readonly wasmFactory: WasmFactory
  ) {
    super();
    this.provider = new PolkadotProvider(
      apiPromise,
      injectedExtension,
      new PolkaTXBuilder(apiPromise, notificationHandler)
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
      mixer: {
        deposit: {
          enabled: true,
          inner: new PolkadotMixerDeposit(this),
        },
        withdraw: {
          enabled: true,
          inner: new PolkadotMixerWithdraw(this),
        },
      },
      variableAnchor: {
        deposit: {
          enabled: true,
          inner: new PolkadotVAnchorDeposit(this),
        },
        withdraw: {
          enabled: true,
          inner: new PolkadotVAnchorWithdraw(this),
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
    let initialSupportedCurrencies: Record<number, Currency> = {};
    for (let currencyConfig of Object.values(config.currencies)) {
      initialSupportedCurrencies[currencyConfig.id] = new Currency(currencyConfig);
    }

    // All supported bridges are supplied by the config, before passing to the state.
    let initialSupportedBridges: Record<number, Bridge> = {};
    for (let bridgeConfig of Object.values(config.bridgeByAsset)) {
      if (Object.keys(bridgeConfig.anchors).includes(typedChainId.toString())) {
        const bridgeCurrency = initialSupportedCurrencies[bridgeConfig.asset];
        const bridgeTargets = bridgeConfig.anchors;
        if (bridgeCurrency.getRole() === CurrencyRole.Governable) {
          initialSupportedBridges[bridgeConfig.asset] = new Bridge(bridgeCurrency, bridgeTargets);
        }
      }
    }

    this.state = new WebbState(initialSupportedCurrencies, initialSupportedBridges);

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
        .action('Update MetaData', () => this.provider.updateMetaData(metaData), 'success')
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

  private async ensureApiInterface() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const merkleRPC = Boolean(this.api.rpc.mt.getLeaves);
    // merkle rpc
    const merklePallet = this.api.query.merkleTreeBn254;
    const mixerPallet = this.api.query.mixerBn254;

    if (!merklePallet || !merkleRPC || !mixerPallet) {
      throw WebbError.from(WebbErrorCodes.InsufficientProviderInterface);
    }
  }

  static async init(
    appName: string, // App name, arbitrary name
    endpoints: string[], // Endpoints of the substrate node
    errorHandler: ApiInitHandler, // Error handler that will be used to catch errors while initializing the provider
    relayerBuilder: PolkadotRelayerManager, // Webb Relayer builder for relaying withdraw
    appConfig: AppConfig, // The whole and current app configuration
    notification: NotificationHandler, // Notification handler that will be used for the provider
    wasmFactory: WasmFactory // A Factory Fn that wil return wasm worker that would be supplied eventually to the `sdk-core`
  ): Promise<WebbPolkadot> {
    const [apiPromise, injectedExtension] = await PolkadotProvider.getParams(appName, endpoints, errorHandler.onError);
    const provider = new PolkadotProvider(apiPromise, injectedExtension, new PolkaTXBuilder(apiPromise, notification));
    const accounts = provider.accounts;
    const chainId = await provider.api.consts.linkableTreeBn254.chainIdentifier;
    const typedChainId = calculateTypedChainId(ChainType.Substrate, chainId.toNumber());
    const instance = new WebbPolkadot(
      apiPromise,
      typedChainId,
      injectedExtension,
      relayerBuilder,
      appConfig,
      notification,
      provider,
      accounts,
      wasmFactory
    );
    /// check metadata update
    await instance.awaitMetaDataCheck();
    await apiPromise.isReady;
    // await instance.ensureApiInterface();
    return instance;
  }

  static async initWithCustomAccountsAdapter(
    appName: string, // App name Arbitrary name
    endpoints: string[], // Endpoints of the substrate node
    errorHandler: ApiInitHandler, // Error handler that will be used to catch errors while initializing the provider
    relayerBuilder: PolkadotRelayerManager, // Webb Relayer builder for relaying withdraw
    appConfig: AppConfig, // The whole and current app configuration
    notification: NotificationHandler, // Notification handler that will be used for the provider
    accounts: AccountsAdapter<InjectedExtension, InjectedAccount>,
    apiPromise: ApiPromise,
    injectedExtension: InjectedExtension,
    wasmFactory: WasmFactory
  ): Promise<WebbPolkadot> {
    const provider = new PolkadotProvider(apiPromise, injectedExtension, new PolkaTXBuilder(apiPromise, notification));
    const chainId = await provider.api.consts.linkableTreeBn254.chainIdentifier;
    const typedChainId = calculateTypedChainId(ChainType.Substrate, chainId.toNumber());
    const instance = new WebbPolkadot(
      apiPromise,
      typedChainId,
      injectedExtension,
      relayerBuilder,
      appConfig,
      notification,
      provider,
      accounts,
      wasmFactory
    );

    await instance.ensureApiInterface();
    /// check metadata update
    await instance.awaitMetaDataCheck();
    await apiPromise.isReady;

    return instance;
  }

  async destroy(): Promise<void> {
    await this.provider.destroy();
  }
}
