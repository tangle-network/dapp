import { EventBus } from '@webb-tools/app-util';
import { WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';

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

export abstract class MixerWithdraw<T> extends EventBus<MixerWithdrawEvents> {
  state: WithdrawState = WithdrawState.Ideal;

  get hasRelayer(): Promise<boolean> {
    return Promise.resolve(false);
  }

  get relayers(): Promise<WebbRelayer[]> {
    return Promise.resolve([]);
  }

  constructor(protected inner: T) {
    super();
  }

  abstract withdraw(note: string, recipient: string): Promise<void>;

  abstract cancelWithdraw(): Promise<void>;
}
