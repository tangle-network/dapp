import { Bridge, BridgeDeposit, BridgeWithdraw } from '@webb-dapp/react-environment/webb-context/bridge';
import { BridgeApi } from '@webb-dapp/react-environment/webb-context/bridge/bridge-api';
import { ChainQuery } from '@webb-dapp/react-environment/webb-context/chain-query';
import { AppConfig } from '@webb-dapp/react-environment/webb-context/common';
import { WebbRelayerBuilder } from '@webb-dapp/react-environment/webb-context/relayer';
import { WrapUnWrap } from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { InteractiveFeedback } from '@webb-dapp/utils/webb-error';
import { AccountsAdapter } from '@webb-dapp/wallet/account/Accounts.adapter';
import { EventBus } from '@webb-tools/app-util';

import { DepositPayload, MixerDeposit, MixerDepositEvents, MixerWithdraw, MixerWithdrawEvents } from './mixer';

/// list of the apis that are available for  the provider
export interface WebbMethods<T> {
  mixer: WebbMixer<T>;
  bridge: WebbBridge<T>;
  wrapUnwrap: WrapAndUnwrap<T>;
  chainQuery: ChainQuery<T>;
  bridgeApi: BridgeApi<T, any>;
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
export interface WrapAndUnwrap<T> {
  core: {
    inner: WrapUnWrap<T>;
    enabled: boolean;
  };
}
export interface WebbBridge<T> {
  core: Bridge | null;
  // deposit
  deposit: WebbMethod<BridgeDeposit<T, DepositPayload>, MixerDepositEvents>;
  // withdraw
  withdraw: WebbMethod<BridgeWithdraw<T>, MixerWithdrawEvents>;
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

type WebApiCalls = {
  addToken(input: any): Promise<void>;
};
export type NotificationKey = string | number;
export type VariantType = 'default' | 'error' | 'success' | 'warning' | 'info';

export type NotificationData = {
  persist: boolean;
  message: string;
  description: string;
  variant: VariantType;
  action: string;
};

export type NotificationApi = {
  addToQueue(data: NotificationData): NotificationKey;
  remove(key: NotificationKey): void;
};
type MethodPath = {
  section: string;
  method: string;
};

export type TXNotificationPayload<T = undefined> = {
  // Generic data for the transaction payload
  data: T;
  // notification key
  key: NotificationKey;
  address: string;
  // More metadata for the transaction path (EX Anchor::Deposit ,VAnchor::Withdraw)
  path: MethodPath;
};
// Transaction notification
export type TXNotification = {
  // Transaction status is in progress
  loading(payload: TXNotificationPayload<any>): NotificationKey;
  // Transaction failed
  failed(payload: TXNotificationPayload<any>): NotificationKey;
  // Transaction Done with success
  finalize(payload: TXNotificationPayload<any>): NotificationKey;
};
export type NotificationLevel = 'loading' | 'error' | 'success' | 'warning' | 'info';

export type NotificationPayload = {
  // Title of the notification
  message: string;
  // details about the notification
  description: string;
  // Event name/ event identifier
  name: 'Transaction';
  // key for a given notification
  key: string;
  //level
  level: NotificationLevel;
  // Record for more metadata
  data?: Record<string, string>;
  // if true the notification will be dismissed by the user or with another action
  persist?: boolean;
};
export type NotificationHandler = ((notification: NotificationPayload) => string | number) & {
  // remove the notification programmatically
  remove(key: string | number): void;
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

  /// relayer
  relayingManager: WebbRelayerBuilder;

  getProvider(): any;
  // Configs
  config: AppConfig;
  // Notification handler
  notificationHandler: NotificationHandler;
}
