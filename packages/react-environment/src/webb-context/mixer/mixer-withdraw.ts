import { EventBus } from '@webb-tools/app-util';
import { WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import { BehaviorSubject, Observable } from 'rxjs';

export enum WithdrawState {
  Canceled,
  Ideal,

  GeneratingZk,

  SendingTransaction,

  Done,
  Failed,
}

export type MixerWithdrawEvents = {
  error: string;
  validationError: {
    note: string;
    recipient: string;
  };
  stateChange: WithdrawState;

  ready: void;
  loading: boolean;
};
type OptionalRelayer = null | WebbRelayer;

export abstract class MixerWithdraw<T> extends EventBus<MixerWithdrawEvents> {
  state: WithdrawState = WithdrawState.Ideal;
  protected emitter = new BehaviorSubject<OptionalRelayer>(null);
  readonly watcher: Observable<OptionalRelayer>;
  private _activeRelayer: OptionalRelayer = null;

  get hasRelayer(): Promise<boolean> {
    return Promise.resolve(false);
  }

  get activeRelayer(): [OptionalRelayer, Observable<OptionalRelayer>] {
    return [this._activeRelayer, this.watcher];
  }

  public setActiveRelayer(relayer: OptionalRelayer) {
    // this._activeRelayer = relayer;
    this.emitter.next(relayer);
  }

  // todo switch to the reactive api
  get relayers(): Promise<WebbRelayer[]> {
    return Promise.resolve([]);
  }

  constructor(protected inner: T) {
    super();
    this.watcher = this.emitter.asObservable();
  }

  abstract withdraw(note: string, recipient: string): Promise<void>;

  abstract cancelWithdraw(): Promise<void>;
}
