import type { TxEventHandlers } from '@webb-tools/abstract-api-provider';
import type { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import type { Hash } from 'viem';

export type DepositContext = {
  assetId: string;
  amount: bigint;
  operatorAccount?: string;
};

export type DelegatorStakeContext = {
  operatorAccount: SubstrateAddress;
  assetId: string;
  amount: bigint;
};

export type ScheduleDelegatorUnstakeContext = DelegatorStakeContext;

export type ExecuteAllDelegatorUnstakeRequestContext = Record<string, unknown>;

export type CancelDelegatorUnstakeRequestContext = {
  unstakeRequests: {
    operatorAccount: SubstrateAddress;
    assetId: string;
    amount: bigint;
  }[];
};

export type ScheduleWithdrawContext = {
  assetId: string;
  amount: bigint;
};

export type ExecuteAllWithdrawRequestContext = Record<string, unknown>;

export type CancelWithdrawRequestContext = {
  withdrawRequests: {
    assetId: string;
    amount: bigint;
  }[];
};

export abstract class RestakeApiBase {
  /**
   * Deposit the amount of an asset into the multi-asset-delegation pallet,
   * if successful, the transaction hash is returned.
   * if failed, no error is thrown, instead, the error is passed to the event handler.
   */
  abstract deposit(
    assetId: string,
    amount: bigint,
    operatorAccount?: string,
    eventHandlers?: Partial<TxEventHandlers<DepositContext>>,
  ): Promise<Hash | null>;

  abstract stake(
    operatorAccount: SubstrateAddress,
    assetId: string,
    amount: bigint,
    eventHandlers?: Partial<TxEventHandlers<DelegatorStakeContext>>,
  ): Promise<Hash | null>;

  abstract scheduleDelegatorUnstake(
    operatorAccount: SubstrateAddress,
    assetId: string,
    amount: bigint,
    eventHandlers?: Partial<TxEventHandlers<ScheduleDelegatorUnstakeContext>>,
  ): Promise<Hash | null>;

  abstract executeDelegatorUnstakeRequests(
    eventHandlers?: Partial<
      TxEventHandlers<ExecuteAllDelegatorUnstakeRequestContext>
    >,
  ): Promise<Hash | null>;

  abstract cancelDelegatorUnstakeRequests(
    unstakeRequests: CancelDelegatorUnstakeRequestContext['unstakeRequests'],
    eventHandlers?: Partial<
      TxEventHandlers<CancelDelegatorUnstakeRequestContext>
    >,
  ): Promise<Hash | null>;

  abstract scheduleWithdraw(
    assetId: string,
    amount: bigint,
    eventHandlers?: Partial<TxEventHandlers<ScheduleWithdrawContext>>,
  ): Promise<Hash | null>;

  abstract executeWithdraw(
    eventHandlers?: Partial<TxEventHandlers<ExecuteAllWithdrawRequestContext>>,
  ): Promise<Hash | null>;

  abstract cancelWithdraw(
    withdrawRequests: CancelWithdrawRequestContext['withdrawRequests'],
    eventHandlers?: Partial<TxEventHandlers<CancelWithdrawRequestContext>>,
  ): Promise<Hash | null>;
}
