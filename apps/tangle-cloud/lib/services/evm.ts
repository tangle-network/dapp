import type { Account, Address } from 'viem';
import BaseServices, { RegisterArgsType } from './base';
import type { Config } from 'wagmi';
import { TxEventHandlers } from '@tangle-network/abstract-api-provider';

export class EvmServices extends BaseServices {
  constructor(
    readonly activeAccount: Address,
    readonly signer: Account | Address,
    readonly provider: Config,
  ) {
    super();
  }

  register = async (
    args: RegisterArgsType,
    eventHandlers?: Partial<{
      onPreRegister: Partial<TxEventHandlers<RegisterArgsType>>;
      onRegister: Partial<TxEventHandlers<RegisterArgsType>>;
    }>,
  ): Promise<void> => {
    console.error('Unimplemented');
    eventHandlers?.onRegister?.onTxFailed?.('Unimplemented', args);
  };
}
