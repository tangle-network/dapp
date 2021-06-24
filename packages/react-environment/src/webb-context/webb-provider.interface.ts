import { AccountsAdapter } from '@webb-dapp/wallet/account/Accounts.adapter';
import { EventBus } from '@webb-tools/app-util';

import { DepositPayload, MixerDeposit, MixerDepositEvents, MixerWithdraw, MixerWithdrawEvents } from './mixer';

export interface WebbMethods<T> {
  mixer: WebbMixer<T>;
}

export type WebbMethod<T extends EventBus<K>, K extends Record<string, unknown>> = {
  inner: T;
  enabled: boolean;
};

export interface WebbMixer<T> {
  // deposit
  deposit: WebbMethod<MixerDeposit<T, DepositPayload>, MixerDepositEvents>;
  // withdraw
  withdraw: WebbMethod<MixerWithdraw<T>, MixerWithdrawEvents>;
}

type FeedbackLevel = 'error' | 'info' | 'warning' | 'success';
type Action = {
  /// indication for the Action level to show action controller in a meaning way
  level: FeedbackLevel;
  /// trigger the callback for the action
  onTrigger: () => {};
};

/// the will be iterated over and generate content for the feedback
type FeedbackEntry = {
  content?: string;
  json?: Record<string, unknown>;
  header?: string;
  list?: string[];
};
/// an object will be used to build the feedback UI
type FeedbackBody = FeedbackEntry[];

class InterActiveFeedback extends EventBus<any> {
  constructor(
    public readonly level: FeedbackLevel,
    public readonly action: Record<string, Action>,
    public readonly onCancel: () => {},
    public readonly feedbackBody: FeedbackBody
  ) {
    super();
  }
}

type ProviderEvents = {
  interactiveFeedback: InterActiveFeedback;
};

export interface WebbApiProvider<T> extends EventBus<ProviderEvents> {
  /// Accounts Adapter will have all methods related to the provider accounts
  accounts: AccountsAdapter<any>;
  /// All of the available methods and api of the provider
  methods: WebbMethods<T>;

  /// A hook will be called to drop the provider and do cleanup listeners etc..
  destroy(): Promise<void> | void;
}
