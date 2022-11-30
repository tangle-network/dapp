import { Note } from '@webb-tools/sdk-core';
import { BehaviorSubject } from 'rxjs';

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

type FixturesStatus = 'Done' | 'Waiting' | 'failed' | number;
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
  name: 'string';
  data?: any;
};
type FailedTransaction = {
  error: string;
  txHash: string;
};
type TransactionStatusMap = {
  [TransactionState.Cancelling]: undefined;
  [TransactionState.Ideal]: undefined;

  [TransactionState.FetchingFixtures]: FixturesProgress;
  [TransactionState.FetchingLeaves]: LeavesProgress;
  [TransactionState.GeneratingZk]: undefined;
  [TransactionState.Intermediate]: IntermediateProgress;
  [TransactionState.SendingTransaction]: string;

  [TransactionState.Done]: string;
  [TransactionState.Failed]: FailedTransaction;
};
type StatusKey = TransactionState;

type ExecutorClosure = (next: Transaction['next']) => void | Promise<void>;

export class Transaction {
  private _status = new BehaviorSubject<
    [StatusKey, TransactionStatusMap[keyof TransactionStatusMap]]
  >([TransactionState.Ideal, undefined]);
  constructor(public readonly name: string) {}

  static new(name: string): Transaction {
    return new Transaction(name);
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
  next<T extends keyof TransactionStatusMap>(
    status: T,
    data: TransactionStatusMap[T]
  ) {
    if (!this.isValidProgress(status)) {
      throw new Error(
        `Invalid progress for ${this.name}: from ${this._status.value[0]} to ${status}`
      );
    }
    this._status.next([status, data]);
  }

  get currentStatus(): [
    TransactionState,
    TransactionStatusMap[keyof TransactionStatusMap]
  ] {
    return this._status.value;
  }
  get $currentStatus() {
    return this._status.asObservable();
  }

  executor(handler: ExecutorClosure) {
    return handler(this.next.bind(this));
  }
}
