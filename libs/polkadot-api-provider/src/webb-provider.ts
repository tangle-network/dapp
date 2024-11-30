import '@polkadot/types/metadata/decorate/types';
import {
  ApiInitHandler,
  NotificationHandler,
  ProvideCapabilities,
  RelayChainMethods,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
} from '@webb-tools/abstract-api-provider';
import { AccountsAdapter } from '@webb-tools/abstract-api-provider/account/Accounts.adapter';
import { EventBus } from '@webb-tools/app-util';
import { ApiConfig, Wallet } from '@webb-tools/dapp-config';
import {
  ActionsBuilder,
  InteractiveFeedback,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import { ApiPromise } from '@polkadot/api';
import {
  InjectedAccount,
  InjectedExtension,
} from '@polkadot/extension-inject/types';

import { VoidFn } from '@polkadot/api/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { PolkadotProvider } from './ext-provider';
import { PolkaTXBuilder } from './transaction';
import { PolkadotECDSAClaims } from './webb-provider/ecdsa-claims';
import { PolkadotCrowdloan } from './webb-provider/crowdloan';

export class WebbPolkadot
  extends EventBus<WebbProviderEvents>
  implements WebbApiProvider<WebbPolkadot>
{
  readonly type = 'polkadot';

  readonly methods: WebbMethods<WebbApiProvider<WebbPolkadot>>;

  readonly relayChainMethods: RelayChainMethods<WebbApiProvider<WebbPolkadot>>;

  readonly api: ApiPromise;
  readonly txBuilder: PolkaTXBuilder;

  readonly newBlockSub = new Set<VoidFn>();

  readonly typedChainidSubject: BehaviorSubject<number>;

  private _newBlock = new BehaviorSubject<null | bigint>(null);

  private constructor(
    readonly apiPromise: ApiPromise,
    typedChainId: number,
    readonly injectedExtension: InjectedExtension,
    readonly config: ApiConfig,
    readonly notificationHandler: NotificationHandler,
    private readonly provider: PolkadotProvider,
    readonly accounts: AccountsAdapter<InjectedExtension, InjectedAccount>,
  ) {
    super();

    this.typedChainidSubject = new BehaviorSubject<number>(typedChainId);

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
      claim: {
        core: new PolkadotECDSAClaims(this),
        enabled: true,
      },
    };
  }

  capabilities?: ProvideCapabilities | undefined;

  getProvider() {
    return this.provider;
  }

  getBlockNumber(): bigint | null {
    return this._newBlock.getValue();
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
          'success',
        )
        .actions();
      const feedback = new InteractiveFeedback(
        'info',
        actions,
        () => {
          return null;
        },
        feedbackEntries,
      );

      /// emit the feedback object
      this.emit('interactiveFeedback', feedback);
    }
  }

  async ensureApiInterface() {
    return true;
  }

  static async init(
    appName: string, // App name, arbitrary name
    endpoints: string[], // Endpoints of the substrate node
    errorHandler: ApiInitHandler, // Error handler that will be used to catch errors while initializing the provider
    apiConfig: ApiConfig, // The whole and current app configuration
    notification: NotificationHandler, // Notification handler that will be used for the provider
    typedChainId: number,
    wallet: Wallet, // Current wallet to initialize
  ): Promise<WebbPolkadot> {
    const [apiPromise, injectedExtension] = await PolkadotProvider.getParams(
      appName,
      endpoints,
      errorHandler.onError,
      wallet,
    );

    const accountsFromExtension = await injectedExtension.accounts.get();
    if (accountsFromExtension.length === 0) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const provider = new PolkadotProvider(
      apiPromise,
      injectedExtension,
      new PolkaTXBuilder(apiPromise, notification, injectedExtension),
    );
    const accounts = provider.accounts;
    const instance = new WebbPolkadot(
      apiPromise,
      typedChainId,
      injectedExtension,
      apiConfig,
      notification,
      provider,
      accounts,
    );
    /// check metadata update
    await instance.awaitMetaDataCheck();
    await apiPromise.isReady;

    await instance.ensureApiInterface();
    // const unsub = await instance.listenerBlocks();
    // instance.newBlockSub.add(unsub);

    return instance;
  }

  static async getApiPromise(endpoint: string): Promise<ApiPromise> {
    return new Promise((resolve, reject) => {
      resolve(
        PolkadotProvider.getApiPromise([endpoint], (error) => reject(error)),
      );
    });
  }

  async destroy(): Promise<void> {
    await this.provider.destroy();
    this.newBlockSub.forEach((unsub) => unsub());
  }

  // private async listenerBlocks() {
  //   const block = await this.provider.api.query.system.number();
  //   this._newBlock.next(block);
  //   const sub = await this.provider.api.rpc.chain.subscribeFinalizedHeads(
  //     (header) => {
  //       this._newBlock.next(header.number.toBigInt());
  //     },
  //   );
  //   return sub;
  // }

  get newBlock(): Observable<bigint | null> {
    return this._newBlock.asObservable();
  }

  async sign(message: string): Promise<string> {
    const { web3Accounts, web3FromSource } = await import(
      '@polkadot/extension-dapp'
    );

    const account = await this.accounts.activeOrDefault;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const allAccounts = await web3Accounts();
    const injectedAccount = allAccounts.find(
      (acc) =>
        acc.address === account.address &&
        acc.meta.name === account.name &&
        acc.meta.source === this.injectedExtension.name,
    );

    if (!injectedAccount) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const injector = await web3FromSource(injectedAccount.meta.source);

    // this injector object has a signer and a signRaw method
    // to be able to sign raw bytes
    const signRaw = injector?.signer?.signRaw;

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
