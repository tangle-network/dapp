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
  onTrigger(): any;
};

/// the will be iterated over and generate content for the feedback
export type FeedbackEntry = {
  content?: string;
  json?: Record<string, unknown>;
  header?: string;
  list?: string[];
};
/// an object will be used to build the feedback UI
export type FeedbackBody = FeedbackEntry[];

export class ActionsBuilder {
  private _actions: Record<string, Action> = {};
  constructor() {}

  static init() {
    return new ActionsBuilder();
  }

  action(name: string, handler: () => any, level: FeedbackLevel = 'info'): ActionsBuilder {
    this._actions[name] = {
      level,
      onTrigger: handler,
    };
    return this;
  }

  actions() {
    return this._actions;
  }
}

export type ApiInitHandler = {
  onError(error: InterActiveFeedback): any;
};

export class InterActiveFeedback extends EventBus<{ canceled: InterActiveFeedback }> {
  private _canceled: boolean = false;

  static actionsBuilder() {
    return ActionsBuilder.init();
  }
  static feedbackEntries(feedbackBody: FeedbackBody): FeedbackBody {
    return feedbackBody;
  }

  constructor(
    public readonly level: FeedbackLevel,
    public readonly actions: Record<string, Action>,
    private readonly _onCancel: () => any,
    public readonly feedbackBody: FeedbackBody
  ) {
    super();
  }

  get canceled() {
    return this._canceled;
  }

  triggerActionAndCancel(name: string) {
    this.actions[name]?.onTrigger();
  }
  cancel() {
    this._canceled = true;
    this.emit('canceled', this);
  }
}

export type WebbProviderEvents<T = any> = {
  interactiveFeedback: InterActiveFeedback;
  providerUpdate: T;
};

export interface WebbApiProvider<T> extends EventBus<WebbProviderEvents> {
  /// Accounts Adapter will have all methods related to the provider accounts
  accounts: AccountsAdapter<any>;
  /// All of the available methods and api of the provider
  methods: WebbMethods<T>;

  /// A hook will be called to drop the provider and do cleanup listeners etc..
  destroy(): Promise<void> | void;
}
