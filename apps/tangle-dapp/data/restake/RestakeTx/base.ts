import type { Hash } from 'viem';

export enum TxEvent {
  SENDING = 'SENDING',
  IN_BLOCK = 'IN_BLOCK',
  FINALIZED = 'FINALIZED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export type TxEventHandlers<Context extends Record<string, unknown>> = {
  onTxSending?: (context: Context) => void | Promise<void>;
  onTxInBlock?: (
    txHash: Hash,
    blockHash: Hash,
    context: Context,
  ) => void | Promise<void>;
  onTxFinalized?: (
    txHash: Hash,
    blockHash: Hash,
    context: Context,
  ) => void | Promise<void>;
  onTxSuccess?: (
    txHash: Hash,
    blockHash: Hash,
    context: Context,
  ) => void | Promise<void>;
  onTxFailed?: (error: string, context: Context) => void | Promise<void>;
};

export type DepositContext = {
  assetId: string;
  amount: bigint;
};

export type DelegateContext = {
  operatorAccount: string;
  assetId: string;
  amount: bigint;
};

export abstract class RestakeTxBase {
  /**
   * Deposit the amount of an asset into the multi-asset-delegation pallet,
   * if successful, the transaction hash is returned.
   * if failed, no error is thrown, instead, the error is passed to the event handler.
   *
   * @param assetId the asset id to deposit
   * @param amount the amount to deposit
   * @param eventHandlers an object of transaction event handlers
   */
  abstract deposit(
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<DepositContext>,
  ): Promise<Hash | null>;

  abstract delegate(
    operatorAccount: string,
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<DelegateContext>,
  ): Promise<Hash | null>;
}
