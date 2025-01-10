import { Hash } from 'viem';

export enum TxEvent {
  SENDING = 'SENDING',
  IN_BLOCK = 'IN_BLOCK',
  FINALIZED = 'FINALIZED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export type TxEventHandlers<Context extends Record<string, unknown>> = {
  onTxSending: (context: Context) => void | Promise<void>;

  onTxInBlock: (
    txHash: Hash,
    blockHash: Hash,
    context: Context,
  ) => void | Promise<void>;

  onTxFinalized: (
    txHash: Hash,
    blockHash: Hash,
    context: Context,
  ) => void | Promise<void>;

  onTxSuccess: (
    txHash: Hash,
    blockHash: Hash,
    context: Context,
  ) => void | Promise<void>;

  onTxFailed: (error: string, context: Context) => void | Promise<void>;
};
