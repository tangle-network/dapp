import { EventBus } from '@webb-tools/app-util';
import { ActiveWebbRelayer, WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import { BehaviorSubject, Observable } from 'rxjs';

export enum WithdrawState {
  Ideal,
  GeneratingZk,
  SendingTransaction,
  Cancelling,
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
export type OptionalRelayer = null | WebbRelayer;
export type OptionalActiveRelayer = null | ActiveWebbRelayer;
export type CancelToken = {
  cancelled: boolean;
};

export abstract class MixerWithdraw<T> extends EventBus<MixerWithdrawEvents> {
  state: WithdrawState = WithdrawState.Ideal;
  protected emitter = new BehaviorSubject<OptionalActiveRelayer>(null);
  readonly watcher: Observable<OptionalActiveRelayer>;
  private _activeRelayer: OptionalActiveRelayer = null;
  cancelToken: CancelToken = { cancelled: false };

  get hasRelayer(): Promise<boolean> {
    return Promise.resolve(false);
  }

  get activeRelayer(): [OptionalActiveRelayer, Observable<OptionalActiveRelayer>] {
    return [this._activeRelayer, this.watcher];
  }

  mapRelayerIntoActive(relayer: OptionalRelayer): Promise<OptionalActiveRelayer> {
    return Promise.resolve(null);
  }

  public async setActiveRelayer(relayer: OptionalRelayer) {
    this._activeRelayer = await this.mapRelayerIntoActive(relayer);
    this.emitter.next(this._activeRelayer);
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
