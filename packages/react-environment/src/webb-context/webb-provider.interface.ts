import { InteractiveFeedback } from '@webb-dapp/utils/webb-error';
import { AccountsAdapter } from '@webb-dapp/wallet/account/Accounts.adapter';
import { EventBus } from '@webb-tools/app-util';

import { DepositPayload, MixerDeposit, MixerDepositEvents, MixerWithdraw, MixerWithdrawEvents } from './mixer';

/// list of the apis that are available for  the provider
export interface WebbMethods<T> {
  mixer: WebbMixer<T>;
}

export type WebbMethod<T extends EventBus<K>, K extends Record<string, unknown>> = {
  //// the underlying provider for the methods
  inner: T;
  enabled: boolean;
};

export interface WebbMixer<T> {
  // deposit
  deposit: WebbMethod<MixerDeposit<T, DepositPayload>, MixerDepositEvents>;
  // withdraw
  withdraw: WebbMethod<MixerWithdraw<T>, MixerWithdrawEvents>;
}

/// TODO improve this and add a spec
/// An interface for Apis pre-initialization
export type ApiInitHandler = {
  /// an error handler for the Api before init
  /*
   * For instance Polkadot provider the dApp will prepare the parameters for the provider
   * This process may have an error
   * */
  onError(error: InteractiveFeedback): any;
};

export type WebbProviderEvents<T = any> = {
  /// event is trigger to show an interactiveFeedback related to the provider
  interactiveFeedback: InteractiveFeedback;
  /// The provider is updated and an action is required to handle this update
  providerUpdate: T;
  // /// accountsChange
  newAccounts: AccountsAdapter<any>;
};

export type ProvideCapabilities = {
  addNetworkRpc: boolean;
  listenForAccountChange: boolean;
  listenForChainChane: boolean;
  hasSessions: boolean;
};

export interface WebbApiProvider<T> extends EventBus<WebbProviderEvents> {
  /// Accounts Adapter will have all methods related to the provider accounts
  accounts: AccountsAdapter<any>;
  /// All of the available methods and api of the provider
  methods: WebbMethods<T>;

  /// A hook will be called to drop the provider and do cleanup listeners etc..
  destroy(): Promise<void> | void;
  capabilities?: ProvideCapabilities;
  endSession?(): Promise<void>;
}
