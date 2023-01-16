import { Note } from '@webb-tools/sdk-core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CancellationToken } from './cancelation-token';
import { notificationApi } from '@webb-tools/webb-ui-components';

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
export type ActionEvent = {
  // Generic Error by the provider or doing an intermediate step
  error: string;
  // Validation Error for the withdrawing note
  // TODO : update this to be more verbose and not just relate to the note but also the params for `generateNote` and `transact`
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

export type FixturesStatus = 'Done' | 'Waiting' | 'Failed' | number;

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

type TransactionMetaData = {
  amount: number;
  tokens: [string, string];
  wallets: {
    src: number;
    dest: number;
  };
  token: string;
  recipient?: string;
  address?: string;
};

type PromiseExec<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void
) => void;

export class Transaction<DonePayload> extends Promise<DonePayload> {
  cancelToken: CancellationToken = new CancellationToken();
  readonly id = String(Date.now() + Math.random());
  readonly timestamp = new Date();
  private _txHash: BehaviorSubject<string | undefined> = new BehaviorSubject<
    string | undefined
  >(undefined);

  private constructor(
    executor: PromiseExec<DonePayload>,
    public readonly name: string,
    public readonly metaData: TransactionMetaData,
    private readonly _status: BehaviorSubject<
      [
        StatusKey,
        TransactionStatusMap<DonePayload>[keyof TransactionStatusMap<DonePayload>]
      ]
    >
  ) {
    super(executor);
  }

  static new<T>(name: string, metadata: TransactionMetaData): Transaction<T> {
    const status = new BehaviorSubject<
      [StatusKey, TransactionStatusMap<T>[keyof TransactionStatusMap<T>]]
    >([TransactionState.Ideal, undefined]);
    const exec: PromiseExec<T> = (resolve, reject) => {
      status
        .forEach(([state, data]) => {
          if (state === TransactionState.Done) {
            resolve(data as T);
          } else if (state === TransactionState.Failed) {
            const failedData = data as FailedTransaction;
            notificationApi.addToQueue({
              variant: 'error',
              message: 'Transaction Failed',
              secondaryMessage: failedData.error,
            });
          }
        })
        .catch((reason) => {
          notificationApi.addToQueue({
            variant: 'error',
            message: 'Executor reject',
            secondaryMessage: reason.toString?.(),
          });
        });
    };
    return new Transaction(exec, name, metadata, status);
  }

  private isValidProgress<T extends TransactionState>(next: T): boolean {
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
    console.log('Transaction update status', [status, data]);
    this._status.next([status, data]);
  }

  fail(error: string): void {
    this.next(TransactionState.Failed, {
      error,
      txHash: this.txHash,
    });
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

  get txHash(): string | undefined {
    return this._txHash.value;
  }

  set txHash(hash: string | undefined) {
    this._txHash.next(hash);
  }

  get $txHash(): Observable<string | undefined> {
    return this._txHash.asObservable();
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
        txHash: this.txHash,
      });
    }
  };
}
