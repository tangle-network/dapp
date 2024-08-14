import type { Account, Address, Hash } from 'viem';
import { Config } from 'wagmi';

import {
  type CancelDelegatorUnstakeRequestContext,
  type CancelWithdrawContext,
  type DelegateContext,
  type DelegatorBondLessContext,
  type DepositContext,
  type ExecuteDelegatorBondLessContext,
  ExecuteWithdrawContext,
  RestakeTxBase,
  type ScheduleWithdrawContext,
  type TxEventHandlers,
} from './base';

export default class EVMRestakeTx extends RestakeTxBase {
  constructor(
    readonly activeAccount: Address,
    readonly signer: Account | Address,
    readonly provider: Config,
  ) {
    super();
  }

  deposit = async (
    assetId: string,
    amount: bigint,
    operatorAccount?: string,
    eventHandlers?: TxEventHandlers<DepositContext>,
  ) => {
    eventHandlers?.onTxFailed?.('EVM deposit not implemented yet', {
      assetId,
      amount,
      operatorAccount,
    });
    return null;
  };

  delegate = async (
    operatorAccount: string,
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<DelegateContext>,
  ) => {
    eventHandlers?.onTxFailed?.('EVM delegate not implemented yet', {
      operatorAccount,
      assetId,
      amount,
    });
    return null;
  };

  scheduleDelegatorUnstake = async (
    operatorAccount: string,
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<DelegatorBondLessContext>,
  ): Promise<`0x${string}` | null> => {
    eventHandlers?.onTxFailed?.(
      'EVM scheduleDelegatorBondLess not implemented yet',
      {
        operatorAccount,
        assetId,
        amount,
      },
    );
    return Promise.resolve(null);
  };

  executeDelegatorUnstakeRequests = async (
    eventHandlers?: TxEventHandlers<ExecuteDelegatorBondLessContext>,
  ): Promise<`0x${string}` | null> => {
    eventHandlers?.onTxFailed?.(
      'EVM executeDelegatorBondLess not implemented yet',
      {},
    );
    return Promise.resolve(null);
  };

  cancelDelegatorUnstakeRequests = async (
    unstakeRequests: CancelDelegatorUnstakeRequestContext['unstakeRequests'],
    eventHandlers?: TxEventHandlers<CancelDelegatorUnstakeRequestContext>,
  ): Promise<`0x${string}` | null> => {
    eventHandlers?.onTxFailed?.(
      'EVM cancelDelegatorBondLess not implemented yet',
      {
        unstakeRequests,
      },
    );
    return Promise.resolve(null);
  };

  scheduleWithdraw = async (
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<ScheduleWithdrawContext>,
  ): Promise<`0x${string}` | null> => {
    eventHandlers?.onTxFailed?.('EVM scheduleWithdraw not implemented yet', {
      assetId,
      amount,
    });
    return Promise.resolve(null);
  };

  executeWithdraw = async (
    eventHandlers?: TxEventHandlers<ExecuteWithdrawContext>,
  ): Promise<Hash | null> => {
    const context = {} as ExecuteWithdrawContext;

    eventHandlers?.onTxFailed?.(
      'EVM executeWithdraw not implemented yet',
      context,
    );

    return Promise.resolve(null);
  };

  cancelWithdraw = async (
    withdrawRequests: CancelWithdrawContext['withdrawRequests'],
    eventHandlers?: TxEventHandlers<CancelWithdrawContext>,
  ): Promise<Hash | null> => {
    const context = { withdrawRequests } as CancelWithdrawContext;

    eventHandlers?.onTxFailed?.(
      'EVM cancelWithdraw not implemented yet',
      context,
    );

    return Promise.resolve(null);
  };
}
