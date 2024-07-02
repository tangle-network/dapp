import type { Account, Address } from 'viem';
import { Config } from 'wagmi';

import { RestakeTxBase, type TxEventHandlers } from './base';

export default class EVMRestakeTx extends RestakeTxBase {
  constructor(
    readonly activeAccount: Address,
    readonly signer: Account | Address,
    readonly provider: Config,
  ) {
    super();

    this.deposit = this.deposit.bind(this);
  }

  public async deposit(
    _assetId: string,
    _amount: bigint,
    _eventHandlers?: TxEventHandlers,
  ) {
    console.warn('EVM deposit not implemented yet');
    // Deposit the asset into the EVM.
    return null;
  }
}
