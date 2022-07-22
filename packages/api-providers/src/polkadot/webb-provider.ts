// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';

import { ApiPromise } from '@polkadot/api';
import { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types';

import { RelayChainMethods } from '../abstracts';
import { AccountsAdapter } from '../account/Accounts.adapter';
import { PolkadotProvider } from '../ext-providers';
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
import { PolkadotAnchorApi } from './anchor-api';
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
  readonly methods: WebbMethods<WebbPolkadot>;
  readonly relayChainMethods: RelayChainMethods<WebbPolkadot>;
  readonly api: ApiPromise;
  readonly txBuilder: PolkaTXBuilder;

  private constructor(
    apiPromise: ApiPromise,
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
      anchorApi: new PolkadotAnchorApi(this, this.config.bridgeByAsset),
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
          enabled: false,
          inner: new PolkadotWrapUnwrap(this),
        },
      },
    };
  }

  capabilities?: ProvideCapabilities | undefined;

  getProvider() {
    return this.provider;
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
    const instance = new WebbPolkadot(
      apiPromise,
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
    const instance = new WebbPolkadot(
      apiPromise,
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
