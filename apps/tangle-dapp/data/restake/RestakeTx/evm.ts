import type { Account, Address } from 'viem';
import { Config } from 'wagmi';

import {
  type DelegateContext,
  type DepositContext,
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
}
