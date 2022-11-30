import { Note } from '@webb-tools/sdk-core';
import { BehaviorSubject } from 'rxjs';
import { CancellationToken } from './cancelation-token';

export interface TXresultBase {
  // method: MethodPath;
  txHash: string;
}

export interface NewNotesTxResult extends TXresultBase {
  outputNotes: Note[];
}

export enum TransactionState {
  Cancelling, // Withdraw canceled
  Ideal, // initial status where the instance is Idea and ready for a withdraw

  FetchingFixtures, // Zero-knowledge files need to be obtained over the network and may take time.
  FetchingLeaves, // To create a merkle proof, the elements of the merkle tree must be fetched.
  GeneratingZk, // There is a withdraw in progress, and it's on the step of generating the Zero-knowledge proof
  SendingTransaction, // There is a withdraw in progress, and it's on the step Sending the Transaction whether directly or through relayers

  Intermediate,

  Done, // the withdraw is Done and succeeded, the next tic the instance should be ideal
  Failed, // the withdraw is Done with a failure, the next tic the instance should be ideal
}

// Events that can be emitted using the {EventBus}
export type WebbWithdrawEvents = {
  // Generic Error by the provider or doing an intermediate step
  error: string;
  // Validation Error for the withdrawing note
  // TODO : update this to be more verbose and not just relate to the note but also the params for `generateNote` and `withdraw`
  validationError: {
    note: string;
    recipient: string;
  };
  // The instance State change event to track the current status of the instance
  stateChange: TransactionState;
  // the instance is ready
  ready: void;
  loading: boolean;
};

export type FixturesStatus = 'Done' | 'Waiting' | 'failed' | number;
type FixturesProgress = {
  // Fixture name -> status
  fixturesList: Map<string, FixturesStatus>;
};
type LeavesProgress = {
  start: number;
  currentRange: [number, number];
  end?: number;
};

type IntermediateProgress = {
  name: string;
  data?: any;
};
type FailedTransaction = {
  error: string;
  txHash?: string;
};
type TransactionStatusMap<DonePayload> = {
  [TransactionState.Cancelling]: undefined;
  [TransactionState.Ideal]: undefined;

  [TransactionState.FetchingFixtures]: FixturesProgress;
  [TransactionState.FetchingLeaves]: LeavesProgress;
  [TransactionState.GeneratingZk]: undefined;
  [TransactionState.Intermediate]: IntermediateProgress;
  [TransactionState.SendingTransaction]: string;

  [TransactionState.Done]: DonePayload;
  [TransactionState.Failed]: FailedTransaction;
};
type StatusKey = TransactionState;
export type TransactionStatusValue<
  Key extends StatusKey,
  DonePayload = any
> = TransactionStatusMap<DonePayload>[Key];
type ExecutorClosure<DonePayload> = (
  next: Transaction<DonePayload>['next']
) => void | Promise<DonePayload>;

export class Transaction<DonePayload> extends Promise<DonePayload> {
  cancelToken: CancellationToken = new CancellationToken();
  readonly id = String(Date.now() + Math.random());
  readonly timestamp = new Date();
  private _txHash?: string;
  private constructor(
    public readonly name: string,
    public readonly amount: number,
    private readonly _status = new BehaviorSubject<
      [
        StatusKey,
        TransactionStatusMap<DonePayload>[keyof TransactionStatusMap<DonePayload>]
      ]
    >([TransactionState.Ideal, undefined])
  ) {
    super((resolve, reject) => {
      _status
        .forEach(([state, data]) => {
          if (state === TransactionState.Done) {
            resolve(data as DonePayload);
          } else if (state === TransactionState.Failed) {
            reject(data as FailedTransaction);
          }
        })
        .catch(reject);
    });
  }

  static new<T>(name: string, amount: number): Transaction<T> {
    return new Transaction(name, amount);
  }
  private isValidProgress<T extends TransactionState>(next: T): boolean {
    /// TODO implement this and standardise all transactions progress
    switch (this._status.value[0]) {
      case TransactionState.Cancelling:
        break;
      case TransactionState.Ideal:
        break;
      case TransactionState.FetchingFixtures:
        break;
      case TransactionState.FetchingLeaves:
        break;
      case TransactionState.GeneratingZk:
        break;
      case TransactionState.SendingTransaction:
        break;
      case TransactionState.Done:
        break;
      case TransactionState.Failed:
        break;
      case TransactionState.Intermediate:
    }
    return true;
  }
  next<Status extends keyof TransactionStatusMap<DonePayload>>(
    status: Status,
    data: TransactionStatusMap<DonePayload>[Status]
  ) {
    if (!this.isValidProgress(status)) {
      throw new Error(
        `Invalid progress for ${this.name}: from ${this._status.value[0]} to ${status}`
      );
    }
    this._status.next([status, data]);
  }
  fail(error: string) {
    this.next(TransactionState.Failed, {
      error,
      txHash: this._txHash,
    });
    throw new Error(error);
  }

  cancel() {
    if (!this.isValidProgress(TransactionState.Cancelling)) {
      throw new Error(
        `Invalid progress for ${this.name}: from ${this._status.value[0]} to ${TransactionState.Cancelling}`
      );
    }
    this.cancelToken.cancel();
  }

  get currentStatus(): [
    TransactionState,
    TransactionStatusMap<DonePayload>[keyof TransactionStatusMap<DonePayload>]
  ] {
    return this._status.value;
  }

  get txHash() {
    return this._txHash;
  }
  set txHash(hash: string) {
    this._txHash = hash;
  }
  get $currentStatus() {
    return this._status.asObservable();
  }

  executor = (handler: ExecutorClosure<DonePayload>) => {
    try {
      return handler(this.next);
    } catch (e) {
      this.next(TransactionState.Failed, {
        error: JSON.stringify(e),
        txHash: this._txHash,
      });
    }
  };
}
