import type { Hash, Hex } from 'viem';

export enum TxEvent {
  SENDING = 'SENDING',
  IN_BLOCK = 'IN_BLOCK',
  FINALIZED = 'FINALIZED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export type TxEventHandlers = {
  onTxSending?: () => void | Promise<void>;
  onTxInBlock?: (txHash: Hex) => void | Promise<void>;
  onTxFinalized?: (txHash: Hex) => void | Promise<void>;
  onTxSuccess?: (txHash: Hex) => void | Promise<void>;
  onTxFailed?: (error: string) => void | Promise<void>;
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
    eventHandlers?: TxEventHandlers,
  ): Promise<Hash | null>;
}
