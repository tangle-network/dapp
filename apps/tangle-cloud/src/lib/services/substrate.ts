import type { ApiPromise } from '@polkadot/api';
import type { Signer } from '@polkadot/types/types';
import type { TxEventHandlers } from '@tangle-network/abstract-api-provider';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { signAndSendExtrinsic } from '@tangle-network/polkadot-api-provider';
import { parseUnits } from 'viem';
import BaseServices, { RegisterArgsType } from './base';

export class SubstrateServices extends BaseServices {
  constructor(
    readonly activeAccount: string,
    readonly signer: Signer,
    readonly provider: ApiPromise,
  ) {
    super();

    this.provider.setSigner(this.signer);
  }

  register = async (
    args: RegisterArgsType,
    eventHandlers?: Partial<{
      onPreRegister: Partial<TxEventHandlers<RegisterArgsType>>;
      onRegister: Partial<TxEventHandlers<RegisterArgsType>>;
    }>,
  ): Promise<void> => {
    const { blueprintIds, preferences, registrationArgs, amount } = args;

    // TODO: Find a better way to get the chain decimals
    const decimals =
      this.provider.registry.chainDecimals.length > 0
        ? this.provider.registry.chainDecimals[0]
        : TANGLE_TOKEN_DECIMALS;

    this.validateRegisterArgs(args);

    const preRegisterExtrinsic = this.provider.tx.utility.batch(
      blueprintIds.map((blueprintId) => {
        return this.provider.tx.services.preRegister(blueprintId);
      }),
    );

    const preRegisterTxHash = await signAndSendExtrinsic(
      this.activeAccount,
      preRegisterExtrinsic,
      args,
      eventHandlers?.onPreRegister,
    );

    // Pre-register transaction failed
    if (preRegisterTxHash === null) {
      return;
    }

    const registerExtrinsic = this.provider.tx.utility.batch(
      blueprintIds.map((blueprintId, idx) => {
        return this.provider.tx.services.register(
          blueprintId,
          preferences[idx],
          registrationArgs[idx],
          parseUnits(amount[idx], decimals),
        );
      }),
    );

    await signAndSendExtrinsic(
      this.activeAccount,
      registerExtrinsic,
      args,
      eventHandlers?.onRegister,
    );
  };
}
