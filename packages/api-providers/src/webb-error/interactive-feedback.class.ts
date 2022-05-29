// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';

export type FeedbackLevel = 'error' | 'info' | 'warning' | 'success';
export type Action = {
  /// indication for the Action level to show action controller in a meaning way
  level: FeedbackLevel;
  /// trigger the callback for the action
  onTrigger(): any;
  /// action name unique for each action of the actions record
  name: string;
  /// Used to know which action is registered
  id: string | null;
};

/// This will be iterated over and generate content for the feedback
export type FeedbackEntry = {
  /// Text element could be a <p/> for instance
  content?: string;
  /// JS object
  json?: Record<string, unknown>;
  /// Header text element
  header?: string;
  /// list of strings
  list?: string[];
  /// A function that will return a dynamic value
  any?(): any;
};
/// an object will be used to build the feedback UI
export type FeedbackBody = FeedbackEntry[];

/// A builder class to build the `Action` for the `InteractiveFeedback`
export class ActionsBuilder {
  /// list of actions of the `ActionsBuilder`
  private _actions: Record<string, Action> = {};

  /// Static method for `init`
  static init() {
    return new ActionsBuilder();
  }

  /// Adds an action for the builder actions
  action(name: string, handler: () => any, level: FeedbackLevel = 'info', id: string | null = null): ActionsBuilder {
    this._actions[name] = {
      id,
      level,
      name,
      onTrigger: handler,
    };

    return this;
  }

  /// Access the actions to pass them to the constructor of the interactive feedback
  actions() {
    return this._actions;
  }
}

/// InteractiveFeedback a class that wrappers and error metadata and provide handlers for it
/// A `canceled` event is trigger only once, when the state changes to be`_canceled=true`
export class InteractiveFeedback extends EventBus<{ canceled: InteractiveFeedback }> {
  private _canceled = false;
  private selectedAction: Action | null = null;

  /// Create a new action builder for the InteractiveFeedback
  static actionsBuilder() {
    return ActionsBuilder.init();
  }

  /// Create the body for the InteractiveFeedback
  static feedbackEntries(feedbackBody: FeedbackBody): FeedbackBody {
    return feedbackBody;
  }

  constructor(
    /// Level of the InteractiveFeedback for customised view
    public readonly level: FeedbackLevel,
    /// Actions available for the InteractiveFeedback instance without the cancel action
    public readonly actions: Record<string, Action>,
    /// handler for the cancel action this is trigger when `interactiveFeedback.cancel` is called
    private readonly _onCancel: () => any,
    /// The body of the interactive feedback showing the message
    public readonly feedbackBody: FeedbackBody,
    /// this can be used to identify the feedback by reason and hide it
    public reason?: number | string
  ) {
    super();
  }

  /// getter for the user to know if this is canceled
  get canceled() {
    return this._canceled;
  }

  /// cancel without calling the onCancel handler
  cancelWithoutHandler() {
    if (this._canceled) {
      return;
    }

    /// change the state of the interactive feedback to be canceled to prevent from a  re-trigger
    this._canceled = true;
    /// emit `canceled` event
    this.emit('canceled', this);
  }

  /// cancel this will trigger the `canceled` event and set the interactiveFeedback as canceled
  cancel() {
    if (this._canceled) {
      return;
    }

    /// change the state of the interactive feedback to be canceled to prevent from a  re-trigger
    this._canceled = true;
    /// emit `canceled` event
    this.emit('canceled', this);
    /// call  the cancel handler
    this._onCancel();
  }

  trigger<ActionKey extends keyof this['actions']>(key: ActionKey) {
    if (this._canceled) {
      return;
    }

    // @ts-ignore
    const action = this.actions[key] as Action;

    if (action) {
      this.selectedAction = action;

      return action.onTrigger?.();
    }
  }

  wait(): Promise<Action | null> {
    if (this._canceled) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      this.on('canceled', () => {
        resolve(this.selectedAction);
      });
    });
  }
}
