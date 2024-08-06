import type { Account, Address } from 'viem';
import { Config } from 'wagmi';

import {
  type CancelDelegatorUnstakeRequestContext,
  type DelegateContext,
  type DelegatorBondLessContext,
  type DepositContext,
  type ExecuteDelegatorBondLessContext,
  RestakeTxBase,
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
}
