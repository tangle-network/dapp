import type { Account, Address } from 'viem';
import { Config } from 'wagmi';

import {
  type CancelDelegatorBondLessContext,
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
    _assetId: string,
    _amount: bigint,
    _operatorAccount?: string,
    _eventHandlers?: TxEventHandlers<DepositContext>,
  ) => {
    console.warn('EVM deposit not implemented yet');
    // Deposit the asset into the EVM.
    return null;
  };

  delegate = async (
    _operatorAccount: string,
    _assetId: string,
    _amount: bigint,
    _eventHandlers?: TxEventHandlers<DelegateContext>,
  ) => {
    console.warn('EVM delegate not implemented yet');
    // Delegate the asset to the operator.
    return null;
  };

  scheduleDelegatorBondLess = async (
    _operatorAccount: string,
    _assetId: string,
    _amount: bigint,
    _eventHandlers?: TxEventHandlers<DelegatorBondLessContext>,
  ): Promise<`0x${string}` | null> => {
    console.warn('EVM scheduleDelegatorBondLess not implemented yet');
    return Promise.resolve(null);
  };

  executeDelegatorBondLess = async (
    _eventHandlers?: TxEventHandlers<ExecuteDelegatorBondLessContext>,
  ): Promise<`0x${string}` | null> => {
    console.warn('EVM executeDelegatorBondLess not implemented yet');
    return Promise.resolve(null);
  };

  cancelDelegatorBondLess = async (
    _eventHandlers?: TxEventHandlers<CancelDelegatorBondLessContext>,
  ): Promise<`0x${string}` | null> => {
    console.warn('EVM cancelDelegatorBondLess not implemented yet');
    return Promise.resolve(null);
  };
}
